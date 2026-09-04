import requests
import json
import time

# Test against LOCALHOST now that we have applied the fix locally
# The user has a local server running on port 8000
API_URL = "http://127.0.0.1:8000"
CHAT_ENDPOINT = f"{API_URL}/api/chat/message"


def check_health():
    try:
        print(f"Checking Health: {API_URL}/health")
        response = requests.get(f"{API_URL}/health", timeout=5)
        print(f"Health Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_chat():
    print(f"Testing Chat Endpoint: {CHAT_ENDPOINT} (Please wait, this may take time...)")
    
    payload = {
        "message": "Hi"
    }
    
    try:
        start_time = time.time()
        response = requests.post(CHAT_ENDPOINT, json=payload, headers={"Content-Type": "application/json"}, timeout=60)
        duration = time.time() - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {duration:.2f}s")
        
        try:
            data = response.json()
            if "response" in data:
                print("\n--- BACKEND RESPONSE ---\n")
                print(data["response"])
                print("\n------------------------\n")
            else:
                print("JSON received but no 'response' field:", data)
        except:
            print("Response Text (Not JSON):", response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_chat()
