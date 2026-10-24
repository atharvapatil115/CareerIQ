
from app.database import SessionLocal
from app.models.discoveredJobs import Discoveredjobs
from app.services.job_sources.greenhouse import fetch_greenhouse_jobs


def sync_greenhouse_jobs(board_token: str) -> int:
    jobs = fetch_greenhouse_jobs(board_token)
    saved_count = 0

    with SessionLocal() as db:
        for job in jobs:
            external_id = str(job["id"])

            existing_job = db.query(Discoveredjobs).filter_by(
                source="greenhouse",
                external_id=external_id,
            ).first()

            if existing_job:
                continue

            location_data = job.get("location") or {}

            new_job = Discoveredjobs(
                title=job["title"],
                company=board_token,
                location=location_data.get("name"),
                description=job.get("content"),
                source="greenhouse",
                external_id=external_id,
                application_url=job["absolute_url"],
            )

            db.add(new_job)
            saved_count += 1

        db.commit()

    return saved_count


if __name__ == "__main__":
    count = sync_greenhouse_jobs("greenhouse")
    print("New jobs saved:", count)