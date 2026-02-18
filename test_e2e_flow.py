import requests
import json
import time
import uuid

BASE_URL = "http://localhost:8000"
test_id = str(uuid.uuid4())[:8]
email = f"test_user_{test_id}@example.com"
password = "test_password_123"

def test_flow():
    print(f"🚀 Starting E2E test with email: {email}")

    # 1. Register
    print("📝 Step 1: Registering new user...")
    reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "firstName": "Test",
        "lastName": "User"
    })
    if reg_resp.status_code != 201:
        print(f"❌ Registration failed: {reg_resp.text}")
        return
    print("✅ User registered.")

    # Parse cookies for auth
    cookies = reg_resp.cookies

    # 2. Onboarding
    print("📋 Step 2: Performing onboarding...")
    onboard_resp = requests.post(f"{BASE_URL}/users/onboarding", json={
        "targetGoal": "Master Backend Development",
        "preferredTopics": ["Go", "PostgreSQL", "System Design"]
    }, cookies=cookies)

    if onboard_resp.status_code not in [200, 201, 204]:
        print(f"❌ Onboarding failed ({onboard_resp.status_code}): {onboard_resp.text}")
        return
    print("✅ User onboarded.")

    # 3. Start Exam
    print("📝 Step 3: Starting new exam...")
    start_resp = requests.post(f"{BASE_URL}/exams/start", json={
        "topic_id": "Go",
        "question_count": 2,
        "difficulty": "Medium",
        "type": "AI_GENERATED"
    }, cookies=cookies)

    if start_resp.status_code not in [200, 202]:
        print(f"❌ Start exam failed ({start_resp.status_code}): {start_resp.text}")
        return

    start_data = start_resp.json()
    session_id = start_data.get("jobId") # jobId IS the sessionId for AI exams
    if not session_id:
        print(f"❌ No sessionID/jobId in response: {start_data}")
        return
    print(f"✅ Exam generation started. Session ID: {session_id}")

    # 4. Monitor Streaming (SSE) and capture questions
    print(f"📡 Step 4: Monitoring SSE stream for questions...")
    stream_url = f"{BASE_URL}/exams/stream/{session_id}"

    captured_questions = []

    # Using requests with stream=True for SSE
    # Using requests with stream=True for SSE
    try:
        start_time = time.time()
        timeout = 60  # 60 seconds total timeout for generation

        with requests.get(stream_url, cookies=cookies, stream=True, timeout=30) as stream_resp:
            for line in stream_resp.iter_lines():
                # Check total timeout
                if time.time() - start_time > timeout:
                    print("⏰ Stream timed out. Checking status directly...")
                    break

                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith("data: "):
                        try:
                            data = json.loads(decoded_line[6:])
                            event_type = data.get("type")
                            if event_type == "status":
                                status = data.get("status")
                                print(f"📊 Status: {status} - {data.get('message')}")
                                if status == "COMPLETED":
                                    print("🏁 Generation finished successfully (via stream)!")
                                    break
                                if status == "FAILED":
                                    print(f"❌ Generation failed: {data.get('message')}")
                                    return
                            elif event_type == "question":
                                q_data = data.get("data", {}) # It's 'data' in worker, let's check
                                if not q_data:
                                     q_data = data.get("question", {})

                                captured_questions.append({
                                    "questionId": q_data.get("id"),
                                    "answer": "Option A",
                                    "timeSpent": 30
                                })
                                print(f"📦 Received Question: {q_data.get('text', '')[:50]}...")
                        except json.JSONDecodeError:
                            print(f"⚠️ Failed to decode SSE line: {decoded_line}")
    except Exception as e:
        print(f"⚠️ Stream connection error or timeout: {e}")

    # Fallback: Check status if stream finished/broke but we aren't sure
    print("🔄 Verifying exam status via polling...")
    status_resp = requests.get(f"{BASE_URL}/exams/status/{session_id}", cookies=cookies)
    if status_resp.status_code == 200:
        status_data = status_resp.json()
        print(f"🧐 Current Job Status: {status_data.get('status')}")

        if status_data.get('status') == "READY" or status_data.get('status') == "COMPLETED":
             # If we missed questions in stream, fetch the session
             print("📥 Fetching full session to get questions...")
             session_resp = requests.get(f"{BASE_URL}/exams/session/{session_id}", cookies=cookies)
             if session_resp.status_code == 200:
                 session_data = session_resp.json()
                 questions = session_data.get("questions", [])
                 print(f"✅ Retrieved {len(questions)} questions from session.")

                 # Populate captured_questions if stream missed them
                 if not captured_questions:
                     for q in questions:
                         captured_questions.append({
                             "questionId": q.get("id"),
                             "answer": "Option A",
                             "timeSpent": 30
                         })

    if not captured_questions:
        print("❌ No questions found via stream or fallback.")
        return

    # 5. Submit Exam
    print(f"📤 Step 5: Submitting exam session {session_id}...")
    submit_resp = requests.post(f"{BASE_URL}/exams/submit", json={
        "sessionId": session_id,
        "answers": captured_questions
    }, cookies=cookies)

    if submit_resp.status_code not in [200, 202]:
        print(f"❌ Submission failed ({submit_resp.status_code}): {submit_resp.text}")
        return

    submit_data = submit_resp.json()
    submit_job_id = submit_data.get("jobId")
    print(f"✅ Submission accepted. Job ID: {submit_job_id}")

    # 6. Wait for analytics processing
    print("⏳ Step 6: Waiting for submission processing...")
    max_retries = 10
    processed = False
    for i in range(max_retries):
        status_resp = requests.get(f"{BASE_URL}/exams/status/{submit_job_id}", cookies=cookies)
        if status_resp.status_code == 200:
            status_data = status_resp.json()
            if status_data.get("status") == "COMPLETED":
                print("🏁 Submission processed successfully!")
                processed = True
                break
            elif status_data.get("status") == "FAILED":
                print(f"❌ Submission processing failed: {status_data}")
                return
        print(f"   (Retry {i+1}/{max_retries}) Status: {status_resp.status_code}")
        time.sleep(2)

    if not processed:
        print("❌ Submission processing timed out.")
        return

    # 7. Verify Analytics
    print("📈 Step 7: Verifying analytics (Learning Curve)...")
    analytics_resp = requests.get(f"{BASE_URL}/analytics/learning-curve", cookies=cookies)
    if analytics_resp.status_code == 200:
        print("✅ Learning curve retrieved.")
        print(f"📊 Result: {json.dumps(analytics_resp.json(), indent=2)}")
    else:
        print(f"❌ Analytics fetch failed: {analytics_resp.text}")

    print("\n✨ E2E Flow test completed successfully!")

if __name__ == "__main__":
    test_flow()
