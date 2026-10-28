
from dotenv import load_dotenv
from mistralai.client import Mistral
import os


load_dotenv()

MODEL_NAME = "mistral-embed"
EMBEDDING_DIMENSION = 1024


def generate_embeddings(texts: list[str]) -> list[list[float]]:

    if not texts:
        return []

    api_key = os.getenv("MISTRAL_API_KEY")

    if not api_key:
        raise RuntimeError(
            "MISTRAL_API_KEY is missing from the environment."
        )

    client = Mistral(api_key=api_key)

    response = client.embeddings.create(
        model=MODEL_NAME,
        inputs=texts,
    )

    ordered_data = sorted(
        response.data,
        key=lambda item: item.index,
    )

    embeddings = [
        item.embedding
        for item in ordered_data
    ]

    if len(embeddings) != len(texts):
        raise RuntimeError(
            "The number of embeddings does not match the inputs."
        )

    for embedding in embeddings:
        if len(embedding) != EMBEDDING_DIMENSION:
            raise RuntimeError(
                f"Expected {EMBEDDING_DIMENSION} dimensions, "
                f"received {len(embedding)}."
            )

    return embeddings
