
def calculate_jd_match_score(
    matched_skills: list[str],
    missing_skills: list[str],
    skill_gaps: list[dict],
) -> float:
    """Estimate job-specific skill coverage from structured evidence."""

    importance_weights = {
        "critical": 4,
        "high": 3,
        "medium": 2,
        "low": 1,
    }

    def normalize(skill: str) -> str:
        return " ".join(skill.casefold().split())

    matched = {normalize(s) for s in matched_skills if s.strip()}
    missing = {normalize(s) for s in missing_skills if s.strip()}

    # Use skill_gaps as the primary source of importance and status.
    assessed = {}

    for gap in skill_gaps:
        skill = gap.get("skill")
        if not isinstance(skill, str) or not skill.strip():
            continue

        key = normalize(skill)
        importance = str(gap.get("importance", "medium")).lower()
        status = str(gap.get("status", "not_evidenced")).lower()

        # Prefer the explicit skills lists if the model omitted
        # matched skills from skill_gaps or contradicted its own output.
        if key in matched:
            status = "matched"
        elif key in missing:
            status = "not_evidenced"

        if status not in {"matched", "partial", "not_evidenced"}:
            status = "not_evidenced"

        assessed[key] = (importance, status)

    # Add skills omitted from skill_gaps, using medium importance
    # because their importance was not explicitly assessed.
    for skill in matched:
        assessed.setdefault(skill, ("medium", "matched"))

    for skill in missing:
        assessed.setdefault(skill, ("medium", "not_evidenced"))

    if not assessed:
        # No requirements were assessed: do not invent a score.
        return 0.0

    total_weight = 0.0
    earned_weight = 0.0

    for importance, status in assessed.values():
        weight = importance_weights.get(importance, 2)
        total_weight += weight

        if status == "matched":
            earned_weight += weight
        elif status == "partial":
            earned_weight += weight * 0.5

    score = earned_weight / total_weight * 100
    return round(max(0.0, min(100.0, score)), 2)


def calculate_resume_quality_score(
    matched_skills: list[str],
    skill_gaps: list[dict],
    recommendations: list[dict],
) -> float:
    """
    Estimate content quality from available evidence.

    This is a provisional heuristic, not an objective measurement
    of the entire resume or its visual design.
    """

    score = 100.0

    high_priority_issues = sum(
        1
        for item in recommendations
        if str(item.get("priority", "")).lower() == "high"
    )

    missing_count = sum(
        1
        for gap in skill_gaps
        if str(gap.get("status", "")).lower() == "not_evidenced"
    )

    partial_count = sum(
        1
        for gap in skill_gaps
        if str(gap.get("status", "")).lower() == "partial"
    )

    # Penalize improvement opportunities without treating
    # missing job-specific skills as proof of poor resume quality.
    score -= min(high_priority_issues * 5, 20)
    score -= min(missing_count * 1, 10)
    score -= min(partial_count * 0.5, 5)

    return round(max(0.0, min(100.0, score)), 2)


def calculate_ats_readiness_score(
    ats_issues: list[str],
    ats_recommendations: list[dict],
) -> float:
    """
    Estimate ATS readiness from reported issues.

    Visual formatting cannot be verified from extracted text alone.
    """

    score = 100.0

    score -= min(len(ats_issues) * 10, 50)

    high_priority_issues = sum(
        1
        for item in ats_recommendations
        if str(item.get("priority", "")).lower() == "high"
    )

    score -= min(high_priority_issues * 5, 25)

    return round(max(0.0, min(100.0, score)), 2)


def build_resume_scores(
    analysis: dict,
) -> dict:
    """Build all KPI scores from the structured analysis."""

    matched_skills = analysis.get("matched_skills", [])
    missing_skills = analysis.get("missing_skills", [])
    skill_gaps = analysis.get("skill_gaps", [])
    jd_recommendations = analysis.get("jd_recommendations", [])
    ats_recommendations = analysis.get("ats_recommendations", [])
    ats_issues = analysis.get("ats_issues", [])

    match_score = calculate_jd_match_score(
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        skill_gaps=skill_gaps,
    )

    resume_score = calculate_resume_quality_score(
        matched_skills=matched_skills,
        skill_gaps=skill_gaps,
        recommendations=jd_recommendations,
    )

    ats_score = calculate_ats_readiness_score(
        ats_issues=ats_issues,
        ats_recommendations=ats_recommendations,
    )

    return {
        "match_score": match_score,
        "overall_resume_score": resume_score,
        "ats_score": ats_score,
        "ats_friendly": ats_score >= 75,
    }
