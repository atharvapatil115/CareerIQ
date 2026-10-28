
from sqlalchemy.orm import Session

from app.models.resume_chunk import ResumeChunk
from app.services.ai.embeddings import generate_embeddings


def search_resume_chunks(
    db: Session,
    resume_id: int,
    query: str,
    limit: int = 5,
) -> list[dict]:
    """Return the most relevant chunks for a query."""

    query = query.strip()

    if not query:
        raise ValueError("Search query cannot be empty.")

    if limit < 1 or limit > 20:
        raise ValueError("Limit must be between 1 and 20.")

    # Generate a vector for the search query.
    query_embedding = generate_embeddings([query])[0]

    # Search only the selected resume's chunks.
    distance = ResumeChunk.embedding.cosine_distance(query_embedding)

    results = (
        db.query(ResumeChunk, distance.label("distance"))
        .filter(
            ResumeChunk.resume_id == resume_id,
            ResumeChunk.embedding.is_not(None),
        )
        .order_by(distance)
        .limit(limit)
        .all()
    )

    return [
        {
            "chunk_id": chunk.id,
            "resume_id": chunk.resume_id,
            "chunk_index": chunk.chunk_index,
            "text": chunk.chunk_text,
            "cosine_distance": float(chunk_distance),
            "similarity": round(
                max(0.0, min(1.0, 1.0 - float(chunk_distance))) * 100,
                2,
            ),
        }
        for chunk, chunk_distance in results
    ]
