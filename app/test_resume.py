
from services.ai.text_cleaner import clean_resume_text
from services.ai.chunker import chunk_resume_text


def test_resume_processing():
    sample = """
    TECHNICAL SKILLS

    Python, SQL, FastAPI

    PROJECTS

    Built a job matching application using Python.
    """

    cleaned = clean_resume_text(sample)
    chunks = chunk_resume_text(cleaned)

    assert "Python" in cleaned
    assert len(chunks) > 0
    assert all(len(chunk) <= 1800 for chunk in chunks)

    print("Cleaned text:")
    print(cleaned)

    print("\nChunks:")
    for index, chunk in enumerate(chunks):
        print(f"\nChunk {index}:")
        print(chunk)


if __name__ == "__main__":
    test_resume_processing()
