import grpc
import sys
import os
import uuid

# Add ai-service to path for proto imports
sys.path.append(os.path.join(os.getcwd(), "ai-service"))
sys.path.append(os.path.join(os.getcwd(), "ai-service", "app", "proto"))

import app.proto.examlytics_pb2 as pb
import app.proto.examlytics_pb2_grpc as pb_grpc

def verify_grpc():
    print("🚀 Starting gRPC connectivity test...")

    # Target address
    address = 'localhost:50051'

    # Create channel
    channel = grpc.insecure_channel(address)
    stub = pb_grpc.ExamlyticsAIStub(channel)

    # Dummy user ID
    user_id = str(uuid.uuid4())

    try:
        # 1. Test PredictPerformance
        print(f"📡 Calling PredictPerformance for user: {user_id}")
        # Note: server has an AuthInterceptor, providing a dummy Bearer token
        metadata = [('authorization', 'Bearer dummy_test_token')]

        request = pb.PredictPerformanceRequest(user_id=user_id)
        response = stub.PredictPerformance(request, metadata=metadata)

        print(f"✅ PredictPerformance Success!")
        print(f"📊 Result - Score: {response.predicted_score}, Risk: {response.risk_level}")

        # 2. Test StreamExplanation
        print("📡 Calling StreamExplanation...")
        stream_req = pb.ExplanationRequest(question_id="test-q-1")
        stream_resp = stub.StreamExplanation(stream_req, metadata=metadata)

        print("📝 Received explanation stream: ", end="", flush=True)
        for chunk in stream_resp:
            print(chunk.chunk, end="", flush=True)
        print("\n✅ StreamExplanation Success!")

    except grpc.RpcError as e:
        print(f"❌ gRPC call failed: {e.code()} - {e.details()}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        channel.close()

if __name__ == "__main__":
    verify_grpc()
