
import pymupdf


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a digitally generated PDF."""

    with pymupdf.open(
        stream=pdf_bytes,
        filetype="pdf",
    ) as document:

        if document.is_encrypted:
            raise ValueError(
                "Password-protected PDFs are not supported."
            )

        pages = []

        for page in document:
            text = page.get_text("text") or ""

            if text.strip():
                pages.append(text)

    extracted_text = "\n\n".join(pages)

    if not extracted_text.strip():
        raise ValueError(
            "No readable text found. This PDF may require OCR."
        )

    return extracted_text
