
def chunk_resume_text(
    text: str,
    max_chars: int = 1800,
    overlap_chars: int = 200,
) -> list[str]:


    if max_chars <= 0:
        raise ValueError("max_chars must be positive.")

    if overlap_chars < 0 or overlap_chars >= max_chars:
        raise ValueError(
            "overlap_chars must be non-negative and smaller than max_chars."
        )

    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n\n")
        if paragraph.strip()
    ]

    chunks = []
    current = ""

    for paragraph in paragraphs:
        # Split unusually long paragraphs into smaller pieces.
        pieces = [
            paragraph[i:i + max_chars]
            for i in range(0, len(paragraph), max_chars)
        ]

        for piece in pieces:
            candidate = f"{current}\n\n{piece}".strip() if current else piece

            if len(candidate) <= max_chars:
                current = candidate
                continue

            if current:
                chunks.append(current)

            overlap = current[-overlap_chars:] if current else ""
            current = f"{overlap}\n\n{piece}".strip() if overlap else piece

            if len(current) > max_chars:
                current = current[-max_chars:]

    if current:
        chunks.append(current)

    return chunks
