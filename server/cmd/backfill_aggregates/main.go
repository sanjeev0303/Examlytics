package main

import (
	"context"
	"log"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/database"
	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/repository"
	"github.com/examlytics/server/pkg/logger"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	cfg := config.Load()
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	logger.Info("Starting backfill of user topic aggregates...")

	// 1. Get all completed sessions
	var sessions []domain.ExamSession
	if err := db.Where("status = ?", domain.SessionCompleted).Find(&sessions).Error; err != nil {
		log.Fatalf("Failed to fetch sessions: %v", err)
	}

	log.Printf("Found %d completed sessions", len(sessions))

	// Map to aggregation
	// User -> Topic -> Stats
	type Stats struct {
		Correct int
		Total   int
		Time    int
		Count   int
	}

	// Pre-fetch topic cache
	var topics []domain.Topic
	db.Find(&topics)
	topicMap := make(map[string]string) // ID -> Name
	for _, t := range topics {
		topicMap[t.ID] = t.Name
	}
	// Also map by Name just in case
	topicNameMap := make(map[string]string)
	for _, t := range topics {
		topicNameMap[t.Name] = t.ID
	}

	repo := repository.NewPostgresExamRepository(db)

	type UserAgg struct {
		SumAccuracy float64
		SumTime     float64
		Count       int
	}

	finalAggs := make(map[string]map[string]*UserAgg) // User -> Topic -> Agg

	for _, sess := range sessions {
		var answers []domain.SessionAnswer
		if err := db.Where("session_id = ?", sess.ID).Preload("Question").Find(&answers).Error; err != nil {
			log.Printf("Failed to fetch answers for session %s", sess.ID)
			continue
		}

		// Calculate session stats
		sessionStats := make(map[string]*Stats)
		for _, ans := range answers {
			topicID := ans.Question.TopicID
			topicName := ans.Question.Topic.Name
			if topicName == "" {
				if name, ok := topicMap[topicID]; ok {
					topicName = name
				}
			}
			key := topicName
			if key == "" {
				key = topicID
			}

			if _, ok := sessionStats[key]; !ok {
				sessionStats[key] = &Stats{}
			}
			st := sessionStats[key]
			st.Total++
			if ans.IsCorrect {
				st.Correct++
			}
			st.Time += ans.TimeSpent
		}

		if _, ok := finalAggs[sess.UserID]; !ok {
			finalAggs[sess.UserID] = make(map[string]*UserAgg)
		}

		for key, st := range sessionStats {
			if _, ok := finalAggs[sess.UserID][key]; !ok {
				finalAggs[sess.UserID][key] = &UserAgg{}
			}
			ua := finalAggs[sess.UserID][key]

			acc := (float64(st.Correct) / float64(st.Total)) * 100
			avgTime := float64(st.Time) / float64(st.Total)

			ua.SumAccuracy += acc
			ua.SumTime += avgTime
			ua.Count++
		}
	}

	// Save
	for userID, topics := range finalAggs {
		for topic, ua := range topics {
			avgAcc := ua.SumAccuracy / float64(ua.Count)
			avgTime := ua.SumTime / float64(ua.Count)

			agg := &domain.UserTopicAggregate{
				UserID:        userID,
				Topic:         topic,
				AvgAccuracy:   avgAcc,
				AvgTime:       avgTime,
				TotalAttempts: ua.Count,
				WeakScore:     (100 - avgAcc) + (avgTime / 5.0),
			}
			if err := repo.UpsertUserTopicAggregate(context.Background(), agg); err != nil {
				log.Printf("Failed to upsert agg for user %s topic %s: %v", userID, topic, err)
			} else {
				log.Printf("Updated %s - %s: Acc %.2f, Count %d", userID, topic, avgAcc, ua.Count)
			}
		}
	}

	logger.Info("Backfill complete.")
}
