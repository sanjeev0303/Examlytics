import logging
import time
import grpc
from concurrent import futures
from typing import AsyncIterable
import sys
import os
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

# Add proto directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "proto"))

# Import generated protobuf code
# Adjust import path based on where this file is run from or installed
import app.proto.examlytics_pb2 as pb
import app.proto.examlytics_pb2_grpc as pb_grpc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.db import SessionLocal
from app.services.analytics.predictive_output import PredictiveOutputService
import uuid

class ExamlyticsAIServicer(pb_grpc.ExamlyticsAIServicer):
    """
    Implementation of the Examlytics AI gRPC service.
    """

    def __init__(self):
        # Initialize any models or resources here
        logger.info("Initializing Examlytics AI Service...")
        # In a real app, you might inject the LLM service here
        pass

    async def GenerateExam(
        self, request: pb.GenerateExamRequest, context: grpc.ServicerContext
    ) -> pb.GenerateExamResponse:
        logger.info(f"Received GenerateExam request for user: {request.user_id}")

        # Mock logic for now - replace with actual AI generation
        try:
            # Simulate processing time
            # await asyncio.sleep(1) # If using async grpc

            questions = []
            for i in range(request.question_count):
                q = pb.QuestionItem(
                    id=f"q-{i+1}",
                    text=f"Sample Question {i+1} on {request.topics[0] if request.topics else 'General'}",
                    options=["Option A", "Option B", "Option C", "Option D"],
                    type="MCQ",
                    difficulty="MEDIUM",
                    topic=request.topics[0] if request.topics else "General",
                    correct_answer="Option A",
                    explanation="This is the explanation."
                )
                questions.append(q)

            return pb.GenerateExamResponse(
                exam_id=f"exam-{int(time.time())}",
                questions=questions,
                time_limit=1800
            )
        except Exception as e:
            logger.error(f"Error generating exam: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return pb.GenerateExamResponse()

    async def AnalyzeExam(
        self, request: pb.AnalyzeExamRequest, context: grpc.ServicerContext
    ) -> pb.AnalyzeExamResponse:
        logger.info(f"Received AnalyzeExam request for exam: {request.exam_id}")

        # Mock logic
        score = 85.5
        return pb.AnalyzeExamResponse(
            score=score,
            accuracy=0.85,
            estimated_percentile=92.0,
            topic_analysis=[
                pb.TopicAnalysisItem(topic_name="Physics", accuracy=0.9, status="STRONG"),
                pb.TopicAnalysisItem(topic_name="Math", accuracy=0.7, status="AVERAGE")
            ],
            weak_topics=["Calculus"],
            improvement_plan=[
                pb.ImprovementItem(topic_name="Calculus", strategy="Practice derivatives", practice_days=5)
            ]
        )

    async def StreamExplanation(
        self, request: pb.ExplanationRequest, context: grpc.ServicerContext
    ) -> AsyncIterable[pb.ExplanationResponse]:
        logger.info(f"Streaming explanation for question: {request.question_id}")

        # Mock streaming response
        explanation_text = "Analysis of your answer... The correct approach uses Newton's Second Law... F = ma..."
        chunk_size = 10

        for i in range(0, len(explanation_text), chunk_size):
            chunk = explanation_text[i:i+chunk_size]
            yield pb.ExplanationResponse(chunk=chunk)
            # await asyncio.sleep(0.1)

    async def PredictPerformance(
        self, request: pb.PredictPerformanceRequest, context: grpc.ServicerContext
    ) -> pb.PredictPerformanceResponse:
        logger.info(f"Predicting performance for user: {request.user_id}")

        db = SessionLocal()
        try:
            output_service = PredictiveOutputService(db)
            projections = output_service.get_performance_projections(uuid.UUID(request.user_id))

            risk_level = "LOW"
            if projections["readinessScore"] < 0.4:
                risk_level = "HIGH"
            elif projections["readinessScore"] < 0.7:
                risk_level = "MEDIUM"

            return pb.PredictPerformanceResponse(
                predicted_score=projections["readinessScore"] * 100, # Simplified mapping
                confidence_score=0.85, # Fixed confidence for now
                risk_level=risk_level
            )
        except Exception as e:
            logger.error(f"Error in PredictPerformance: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return pb.PredictPerformanceResponse()
        finally:
            db.close()

class AuthInterceptor(grpc.aio.ServerInterceptor):
    async def intercept_service(self, continuation, handler_call_details):
        metadata = dict(handler_call_details.invocation_metadata)
        auth_header = metadata.get('authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Rejecting gRPC call: Missing or invalid authorization")
            async def abort(request, context):
                await context.abort(grpc.StatusCode.UNAUTHENTICATED, "Missing authorization")
            return grpc.unary_unary_rpc_method_handler(abort)

        # For now, we trust the gRPC metadata if provided
        return await continuation(handler_call_details)

async def serve():
    server = grpc.aio.server(
        futures.ThreadPoolExecutor(max_workers=10),
        interceptors=[AuthInterceptor()]
    )
    pb_grpc.add_ExamlyticsAIServicer_to_server(ExamlyticsAIServicer(), server)
    listen_addr = '[::]:50051'
    server.add_insecure_port(listen_addr)
    logger.info(f"Starting gRPC server on {listen_addr}")
    await server.start()
    await server.wait_for_termination()

if __name__ == '__main__':
    import asyncio
    asyncio.run(serve())
