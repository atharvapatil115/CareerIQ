import httpx

def fetch_greenhouse_jobs(board_token:str) -> list[dict]:
       url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs"

       response = httpx.get(
        url,
        params={"content": "true"},
        timeout=20.0,
    )

       response.raise_for_status()

       data = response.json()
       return data.get("jobs", [])

