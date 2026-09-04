import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print(f"Checking API Key...")
if not api_key:
    print("[MISSING] GEMINI_API_KEY is missing in environment variables.")
else:
    print(f"[FOUND] GEMINI_API_KEY is found (Length: {len(api_key)})")
    # print(f"Key: {api_key[:5]}...{api_key[-5:]}")

print("\n--- Testing Gemini Direct ---")
try:
    genai.configure(api_key=api_key)
    
    # Try the model we want to use
    model_name = 'gemini-1.5-flash'
    print(f"Attempting to use model: {model_name}")
    model = genai.GenerativeModel(model_name)
    
    response = model.generate_content("Hello")
    print(f"[SUCCESS] Response: {response.text}")
    
except Exception as e:
    print(f"[ERROR] Error using Gemini: {e}")
    
    print("\nListing available models:")
    try:
        for m in genai.list_models():
             if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as list_err:
        print(f"[ERROR] Could not list models: {list_err}")
