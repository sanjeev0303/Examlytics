#!/usr/bin/env python3
"""
Test script to verify JSON repair functionality.
"""
import json
from app.core.llm import repair_json

def test_unterminated_string():
    """Test that unterminated strings are repaired"""
    broken = '{"questions": [{"text": "What is AI?'
    repaired = repair_json(broken)

    try:
        data = json.loads(repaired)
        print("✅ Test 1 PASSED: Unterminated string repaired")
    except json.JSONDecodeError as e:
        print(f"❌ Test 1 FAILED: {e}")
        raise

def test_markdown_removal():
    """Test that markdown code blocks are removed"""
    markdown = '```json\n{"test": "value"}\n```'
    repaired = repair_json(markdown)

    try:
        data = json.loads(repaired)
        assert data["test"] == "value"
        print("✅ Test 2 PASSED: Markdown removed successfully")
    except json.JSONDecodeError as e:
        print(f"❌ Test 2 FAILED: {e}")
        raise

def test_missing_closing_brackets():
    """Test that missing brackets are added"""
    broken = '[{"name": "test", "value": 123'
    repaired = repair_json(broken)

    try:
        data = json.loads(repaired)
        assert isinstance(data, list)
        print("✅ Test 3 PASSED: Missing brackets added")
    except json.JSONDecodeError as e:
        print(f"❌ Test 3 FAILED: {e}")
        raise

def test_triple_backtick_without_json():
    """Test markdown removal with plain backticks"""
    markdown = '```\n{"test": "value"}\n```'
    repaired = repair_json(markdown)

    try:
        data = json.loads(repaired)
        assert data["test"] == "value"
        print("✅ Test 4 PASSED: Plain backticks removed")
    except json.JSONDecodeError as e:
        print(f"❌ Test 4 FAILED: {e}")
        raise

def test_complex_repair():
    """Test complex scenario with multiple issues"""
    broken = '```json\n[{"question": "What is Python?", "answer": "A programming language'
    repaired = repair_json(broken)

    try:
        data = json.loads(repaired)
        print("✅ Test 5 PASSED: Complex repair successful")
    except json.JSONDecodeError as e:
        print(f"❌ Test 5 FAILED: {e}")
        raise

if __name__ == "__main__":
    print("🧪 Running JSON Repair Tests...\n")

    test_unterminated_string()
    test_markdown_removal()
    test_missing_closing_brackets()
    test_triple_backtick_without_json()
    test_complex_repair()

    print("\n🎉 All JSON repair tests PASSED!")
