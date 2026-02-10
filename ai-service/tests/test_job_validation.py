#!/usr/bin/env python3
"""
Test script to verify job validation logic.
"""
import time
from app.worker.exam_worker import validate_job

def test_valid_job():
    """Test that valid jobs pass validation"""
    valid_job = {
        "job_id": "test-123",
        "user_id": "user-456",
        "source": "client",
        "created_at": time.time()
    }
    is_valid, reason = validate_job(valid_job)
    assert is_valid, f"Valid job should pass: {reason}"
    print("✅ Test 1 PASSED: Valid job accepted")

def test_missing_source():
    """Test that jobs without source are rejected"""
    invalid_job = {
        "job_id": "test-123",
        "user_id": "user-456",
        "created_at": time.time()
    }
    is_valid, reason = validate_job(invalid_job)
    assert not is_valid, "Job without source should be rejected"
    assert "source" in reason.lower(), f"Reason should mention source: {reason}"
    print("✅ Test 2 PASSED: Job without source rejected")

def test_invalid_source():
    """Test that jobs with source != 'client' are rejected"""
    invalid_job = {
        "job_id": "test-123",
        "user_id": "user-456",
        "source": "system",
        "created_at": time.time()
    }
    is_valid, reason = validate_job(invalid_job)
    assert not is_valid, "Job with system source should be rejected"
    print("✅ Test 3 PASSED: Job with invalid source rejected")

def test_stale_job():
    """Test that old jobs are rejected"""
    stale_job = {
        "job_id": "test-123",
        "user_id": "user-456",
        "source": "client",
        "created_at": time.time() - 90000  # 25 hours ago
    }
    is_valid, reason = validate_job(stale_job)
    assert not is_valid, "Stale job should be rejected"
    assert "stale" in reason.lower(), f"Reason should mention stale: {reason}"
    print("✅ Test 4 PASSED: Stale job rejected")

def test_missing_required_fields():
    """Test that jobs missing required fields are rejected"""
    for missing_field in ["job_id", "user_id", "created_at"]:
        incomplete_job = {
            "job_id": "test-123",
            "user_id": "user-456",
            "source": "client",
            "created_at": time.time()
        }
        del incomplete_job[missing_field]

        is_valid, reason = validate_job(incomplete_job)
        assert not is_valid, f"Job without {missing_field} should be rejected"
        assert missing_field in reason, f"Reason should mention {missing_field}: {reason}"
        print(f"✅ Test 5.{missing_field} PASSED: Job without {missing_field} rejected")

if __name__ == "__main__":
    print("🧪 Running Job Validation Tests...\n")

    test_valid_job()
    test_missing_source()
    test_invalid_source()
    test_stale_job()
    test_missing_required_fields()

    print("\n🎉 All tests PASSED!")
