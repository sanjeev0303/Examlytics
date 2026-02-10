package main

import (
	"fmt"
	"log"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/database"
	"github.com/examlytics/server/internal/domain"
	"github.com/joho/godotenv"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	cfg := config.Load()
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := seed(db); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Seeding completed successfully")
}

func seed(db *gorm.DB) error {
	// 1. Create Topics
	topics := []domain.Topic{
		{Name: "Arrays", Description: "Array data structures"},
		{Name: "Strings", Description: "String manipulation"},
		{Name: "Algorithms", Description: "Algorithm design and analysis"},
		{Name: "Data Structures", Description: "Data structures"},
		{Name: "System Design", Description: "System design principles"},
		{Name: "Logical Reasoning", Description: "General logic"},
		{Name: "Data Interpretation", Description: "Chart and table analysis"},
		{Name: "Quantitative Aptitude", Description: "Math and quantitative skills"},
		{Name: "Physics", Description: "Physics concepts"},
		{Name: "Chemistry", Description: "Chemistry concepts"},
		{Name: "Mathematics", Description: "Mathematics"},
	}

	for _, t := range topics {
		if err := db.FirstOrCreate(&t, domain.Topic{Name: t.Name}).Error; err != nil {
			return err
		}
	}

	// Fetch topics back to get IDs
	var dbTopics []domain.Topic
	db.Find(&dbTopics)
	topicMap := make(map[string]string)
	for _, t := range dbTopics {
		topicMap[t.Name] = t.ID
	}

	// 2. Create Exams (Templates)
	exams := []domain.Exam{
		{
			Title:       "Software Engineering Job Mock",
			Description: "Standard technical interview for SDE roles.",
			Duration:    60,
			Difficulty:  domain.DifficultyMedium,
			Type:        "JOB",
			IsPublic:    true,
		},
		{
			Title:       "Frontend Coding Challenge",
			Description: "React and Javascript focused capability test.",
			Duration:    45,
			Difficulty:  domain.DifficultyEasy,
			Type:        "CODING",
			IsPublic:    true,
		},
		{
			Title:       "JEE Advanced Physics",
			Description: "High difficulty physics problems for JEE aspirants.",
			Duration:    90,
			Difficulty:  domain.DifficultyHard,
			Type:        "JEE",
			IsPublic:    true,
		},
		{
			Title:       "General Aptitude Test",
			Description: "Logical reasoning and quantitative aptitude.",
			Duration:    30,
			Difficulty:  domain.DifficultyMedium,
			Type:        "APTITUDE",
			IsPublic:    true,
		},
	}

	for _, e := range exams {
		if err := db.Where("title = ?", e.Title).FirstOrCreate(&e).Error; err != nil {
			return err
		}
	}

	// 3. Create Questions
	questions := []domain.Question{
		// Arrays Easy
		{
			Text:          "What is the time complexity of accessing an element in an array by index?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Arrays"],
			Options:       pq.StringArray{"O(1)", "O(n)", "O(log n)", "O(n log n)"},
			CorrectAnswer: "O(1)",
			Explanation:   "Array access by index is constant time.",
		},
		{
			Text:          "Which data structure allows access to elements by index?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Arrays"],
			Options:       pq.StringArray{"Array", "Linked List", "Stack", "Queue"},
			CorrectAnswer: "Array",
			Explanation:   "Arrays provide random access by index.",
		},
		{
			Text:          "What is the first index of an array in most programming languages?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Arrays"],
			Options:       pq.StringArray{"0", "1", "-1", "Depends on language"},
			CorrectAnswer: "0",
			Explanation:   "Arrays are zero-indexed in most languages.",
		},
		{
			Text:          "What is the time complexity of linear search in an array?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyMedium,
			TopicID:       topicMap["Arrays"],
			Options:       pq.StringArray{"O(1)", "O(n)", "O(log n)", "O(n log n)"},
			CorrectAnswer: "O(n)",
			Explanation:   "Linear search checks each element sequentially.",
		},
		{
			Text:          "What is the time complexity of binary search in a sorted array?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyHard,
			TopicID:       topicMap["Arrays"],
			Options:       pq.StringArray{"O(1)", "O(n)", "O(log n)", "O(n log n)"},
			CorrectAnswer: "O(log n)",
			Explanation:   "Binary search halves the search space each time.",
		},
		// Strings Easy
		{
			Text:          "Which of the following is used to find the length of a string in C++?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Strings"],
			Options:       pq.StringArray{"length()", "size()", "count()", "Both A and B"},
			CorrectAnswer: "Both A and B",
			Explanation:   "In C++, both length() and size() return the number of characters.",
		},
		{
			Text:          "What is a string?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Strings"],
			Options:       pq.StringArray{"Sequence of characters", "Number", "Array of integers", "Boolean value"},
			CorrectAnswer: "Sequence of characters",
			Explanation:   "A string is a sequence of characters.",
		},
		{
			Text:          "What does the substr() function do in C++?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyMedium,
			TopicID:       topicMap["Strings"],
			Options:       pq.StringArray{"Finds substring", "Replaces characters", "Returns part of string", "Splits string"},
			CorrectAnswer: "Returns part of string",
			Explanation:   "substr() extracts a substring from a string.",
		},
		{
			Text:          "What is the output of 'hello'.substr(1, 3) in C++?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyHard,
			TopicID:       topicMap["Strings"],
			Options:       pq.StringArray{"ell", "llo", "hel", "ello"},
			CorrectAnswer: "ell",
			Explanation:   "'hello'.substr(1, 3) starts at index 1 and takes 3 characters: e,l,l",
		},
		// Logical Reasoning Easy
		{
			Text:          "If A is taller than B and B is taller than C, who is the shortest?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Logical Reasoning"],
			Options:       pq.StringArray{"A", "B", "C", "Cannot be determined"},
			CorrectAnswer: "C",
			Explanation:   "A > B > C, so C is shortest.",
		},
		{
			Text:          "What is the next number in the sequence: 2, 4, 6, 8, ...?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Logical Reasoning"],
			Options:       pq.StringArray{"10", "9", "12", "14"},
			CorrectAnswer: "10",
			Explanation:   "It's even numbers: 2,4,6,8,10.",
		},
		{
			Text:          "All roses are flowers. Some flowers fade quickly. Does it follow that some roses fade quickly?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyMedium,
			TopicID:       topicMap["Logical Reasoning"],
			Options:       pq.StringArray{"Yes", "No", "Cannot be determined", "Maybe"},
			CorrectAnswer: "Cannot be determined",
			Explanation:   "No direct link between roses and fading quickly.",
		},
		{
			Text:          "Which logical fallacy is: 'Everyone is doing it, so it must be right'?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyHard,
			TopicID:       topicMap["Logical Reasoning"],
			Options:       pq.StringArray{"Ad Hominem", "Bandwagon", "Slippery Slope", "False Dichotomy"},
			CorrectAnswer: "Bandwagon",
			Explanation:   "Bandwagon fallacy assumes something is correct because many believe it.",
		},
		// Data Interpretation Easy
		{
			Text:          "In a bar chart showing sales, what does the height of each bar represent?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Data Interpretation"],
			Options:       pq.StringArray{"Categories", "Values", "Labels", "Colors"},
			CorrectAnswer: "Values",
			Explanation:   "Bar height represents the quantity or value.",
		},
		{
			Text:          "What is the purpose of a pie chart?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyEasy,
			TopicID:       topicMap["Data Interpretation"],
			Options:       pq.StringArray{"Show trends", "Show proportions", "Show comparisons", "Show sequences"},
			CorrectAnswer: "Show proportions",
			Explanation:   "Pie charts show parts of a whole.",
		},
		{
			Text:          "If a pie chart shows 50% red and 50% blue, what is the ratio of red to total?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyMedium,
			TopicID:       topicMap["Data Interpretation"],
			Options:       pq.StringArray{"1:1", "1:2", "2:1", "1:4"},
			CorrectAnswer: "1:2",
			Explanation:   "50% red means red:total = 1:2.",
		},
		{
			Text:          "In data interpretation, what does 'trend' refer to?",
			Type:          domain.QuestionTypeMCQ,
			Difficulty:    domain.DifficultyHard,
			TopicID:       topicMap["Data Interpretation"],
			Options:       pq.StringArray{"Average", "Direction of change", "Variance", "Median"},
			CorrectAnswer: "Direction of change",
			Explanation:   "Trend shows how data changes over time or categories.",
		},
	}

	for _, q := range questions {
		if err := db.FirstOrCreate(&q, domain.Question{Text: q.Text}).Error; err != nil {
			return err
		}
	}

	return nil
}
