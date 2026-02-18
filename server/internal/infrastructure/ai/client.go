package ai

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	pb "github.com/examlytics/server/pkg/proto/examlytics/v1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

type ExamlyticsClient struct {
	client pb.ExamlyticsAIClient
	conn   *grpc.ClientConn
}

func NewExamlyticsClient(address string) (*ExamlyticsClient, error) {
	// Interceptor to inject JWT from context metadata
	unaryInterceptor := func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		if rawToken, ok := ctx.Value("raw_token").(string); ok && rawToken != "" {
			ctx = metadata.AppendToOutgoingContext(ctx, "authorization", "Bearer "+rawToken)
		}
		return invoker(ctx, method, req, reply, cc, opts...)
	}

	streamInterceptor := func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		if rawToken, ok := ctx.Value("raw_token").(string); ok && rawToken != "" {
			ctx = metadata.AppendToOutgoingContext(ctx, "authorization", "Bearer "+rawToken)
		}
		return streamer(ctx, desc, cc, method, opts...)
	}

	conn, err := grpc.Dial(address,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithUnaryInterceptor(unaryInterceptor),
		grpc.WithStreamInterceptor(streamInterceptor),
	)
	if err != nil {
		return nil, fmt.Errorf("did not connect: %v", err)
	}

	c := pb.NewExamlyticsAIClient(conn)
	return &ExamlyticsClient{
		client: c,
		conn:   conn,
	}, nil
}

func (c *ExamlyticsClient) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}

func (c *ExamlyticsClient) GenerateExam(ctx context.Context, userID string, topic string, count int) (*pb.GenerateExamResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second) // Longer timeout for generation
	defer cancel()

	req := &pb.GenerateExamRequest{
		UserId:        userID,
		ExamType:      "PRACTICE", // Default currently
		Mode:          "MIXED",
		QuestionCount: int32(count),
		Topics:        []string{topic},
	}

	return c.client.GenerateExam(ctx, req)
}

func (c *ExamlyticsClient) AnalyzeExam(ctx context.Context, examID string, userID string, responses []*pb.ResponseItem) (*pb.AnalyzeExamResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	req := &pb.AnalyzeExamRequest{
		ExamId:    examID,
		UserId:    userID,
		Responses: responses,
	}

	return c.client.AnalyzeExam(ctx, req)
}

func (c *ExamlyticsClient) StreamExplanation(ctx context.Context, questionID string) (chan string, error) {
	req := &pb.ExplanationRequest{
		QuestionId: questionID,
	}

	stream, err := c.client.StreamExplanation(ctx, req)
	if err != nil {
		return nil, err
	}

	ch := make(chan string)

	go func() {
		defer close(ch)
		for {
			resp, err := stream.Recv()
			if err == io.EOF {
				return
			}
			if err != nil {
				log.Printf("Error receiving explanation stream: %v", err)
				return
			}
			ch <- resp.Chunk
		}
	}()

	return ch, nil
}

func (c *ExamlyticsClient) PredictPerformance(ctx context.Context, userID string) (*pb.PredictPerformanceResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req := &pb.PredictPerformanceRequest{
		UserId: userID,
	}

	return c.client.PredictPerformance(ctx, req)
}
