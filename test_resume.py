
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing from .env")

client = Groq(
    api_key=api_key,
    timeout=20.0,
    max_retries=0,
)

print("Sending request to Groq...", flush=True)

try:
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": "Reply with exactly: Groq API working",
            }
        ],
        max_completion_tokens=100,
    )

    print("Response:", response.choices[0].message.content)

except Exception as error:
    print(f"Error: {type(error).__name__}: {error}")
