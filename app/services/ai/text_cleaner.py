
import re


def clean_resume_text(text: str) -> str:
    """Normalize whitespace while preserving useful structure."""

    text = text.replace("\x00", "")
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Normalize horizontal whitespace without deleting paragraph breaks.
    text = re.sub(r"[^\S\n]+", " ", text)

    # Remove spaces around line breaks.
    text = re.sub(r" *\n *", "\n", text)

    # Collapse excessive blank lines.
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()
