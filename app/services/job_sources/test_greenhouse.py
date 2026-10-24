
from greenhouse import fetch_greenhouse_jobs

jobs = fetch_greenhouse_jobs("greenhouse")

print("Total jobs fetched:", len(jobs))

for job in jobs[:3]:
    print("\nTitle:", job.get("title"))
    print("Location:", job.get("location", {}).get("name"))
    print("Apply URL:", job.get("absolute_url"))
    print("Description available:", bool(job.get("content")))
