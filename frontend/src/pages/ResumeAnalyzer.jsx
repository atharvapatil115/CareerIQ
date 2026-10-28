
import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { apiUrl } from "../api";


function ResumeAnalyzer() {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeId, setResumeId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function readResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Something went wrong. Please try again."
      );
    }

    return data;
  }

  async function handleAnalyze(event) {
    event.preventDefault();
    setError("");
    setAnalysis(null);
    setLoading(true);

    try {
      let currentResumeId = resumeId;

      // Upload the PDF only when a new file is selected.
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch(apiUrl("/resumes/upload"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await readResponse(uploadResponse);

        currentResumeId = uploadData.resume_id;
        setResumeId(currentResumeId);
        setFile(null);
      }

      if (!currentResumeId) {
        throw new Error("Please upload your resume PDF first.");
      }

      const response = await fetch(
        apiUrl(`/resumes/${currentResumeId}/analyze`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_description: jobDescription,
          }),
        }
      );

      const result = await readResponse(response);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function ScoreCard({ label, score, description }) {
    return (
      <article className="ra-score-card">
        <span>{label}</span>
        <strong>
          {score == null ? "—" : `${Number(score).toFixed(1)}%`}
        </strong>
        <small>{description}</small>
      </article>
    );
  }

  return (
    <section className="resume-analyzer">
      <header className="ra-header">
        <div>
          <p className="ra-eyebrow">AI-POWERED CAREER TOOLS</p>
          <h1>Resume Analyzer</h1>
          <p>
            Discover how well your resume matches a job and what you
            can improve before applying.
          </p>
        </div>
      </header>

      <form className="ra-form" onSubmit={handleAnalyze}>
        <label className="ra-field">
          <span>Resume PDF</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setResumeId(null);
              setAnalysis(null);
            }}
            required={!resumeId}
          />
          <small>
            PDF only, maximum 10 MB.
            {resumeId && !file
              ? ` Using previously uploaded resume #${resumeId}.`
              : ""}
          </small>
        </label>

        <label className="ra-field">
          <span>Job description</span>
          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the complete job description here..."
            rows={9}
            minLength={50}
            maxLength={20000}
            required
          />
          <small>{jobDescription.length} / 20,000 characters</small>
        </label>

        {error && <p className="ra-error">{error}</p>}

        <button className="ra-primary-button" disabled={loading}>
          {loading ? "Analyzing your resume..." : "Analyze Resume"}
        </button>

        {loading && (
          <p className="ra-loading-note">
            Uploading and analyzing may take a little while. Please keep
            this page open.
          </p>
        )}
      </form>

      {analysis && (
        <div className="ra-results">
          <div className="ra-results-heading">
            <div>
              <p className="ra-eyebrow">YOUR REPORT</p>
              <h2>Analysis Results</h2>
              <p>
                Analysis #{analysis.analysis_id} · Resume #{analysis.resume_id}
              </p>
            </div>
          </div>

          <div className="ra-score-grid">
            <ScoreCard
              label="Job Match"
              score={analysis.match_score}
              description="Estimated alignment with this job"
            />
            <ScoreCard
              label="Resume Quality"
              score={analysis.overall_resume_score}
              description="Heuristic quality estimate"
            />
            <ScoreCard
              label="ATS Readiness"
              score={analysis.ats_score}
              description="Heuristic ATS estimate"
            />
          </div>

          <section className="ra-panel">
            <h3>Analysis Summary</h3>
            <p>{analysis.analysis_summary || "No summary available."}</p>
          </section>

          <div className="ra-skill-grid">
            <section className="ra-panel">
              <h3>Matched Skills</h3>
              {analysis.matched_skills?.length ? (
                <ul className="ra-skill-list">
                  {analysis.matched_skills.map((skill, index) => (
                    <li className="ra-matched" key={`${skill}-${index}`}>
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No matched skills returned.</p>
              )}
            </section>

            <section className="ra-panel">
              <h3>Skills to Address</h3>
              {analysis.missing_skills?.length ? (
                <ul className="ra-skill-list">
                  {analysis.missing_skills.map((skill, index) => (
                    <li className="ra-missing" key={`${skill}-${index}`}>
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No missing skills returned.</p>
              )}
              <small>
                These skills were not sufficiently evidenced in the
                supplied resume; this does not mean you lack them.
              </small>
            </section>
          </div>

          <section className="ra-panel">
            <h3>Skill Gap Details</h3>
            {analysis.skill_gaps?.length ? (
              <div className="ra-gap-list">
                {analysis.skill_gaps.map((gap, index) => (
                  <article className="ra-gap-item" key={`${gap.skill}-${index}`}>
                    <div className="ra-gap-heading">
                      <strong>{gap.skill}</strong>
                      <span>{gap.status?.replaceAll("_", " ")}</span>
                    </div>
                    <small>Importance: {gap.importance}</small>
                    <p>{gap.explanation}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>No skill gap details returned.</p>
            )}
          </section>

          <section className="ra-panel">
            <h3>Recommendations</h3>
            {[
              {
                title: "Job Description Alignment",
                items: analysis.jd_recommendations || [],
              },
              {
                title: "ATS Optimization",
                items: analysis.ats_recommendations || [],
              },
            ].map((group) => (
              <div className="ra-recommendation-group" key={group.title}>
                <h4>{group.title}</h4>
                {group.items.length ? (
                  group.items.map((item, index) => (
                    <article
                      className="ra-recommendation"
                      key={`${item.title}-${index}`}
                    >
                      <div className="ra-recommendation-heading">
                        <h4>{item.title}</h4>
                        <span>{item.priority} priority</span>
                      </div>
                      <p>{item.explanation}</p>
                      <p>
                        <strong>Suggested action: </strong>
                        {item.suggested_change}
                      </p>
                      {item.proposed_text && (
                        <div className="ra-proposed-text">
                          <strong>Proposed wording — review before using</strong>
                          <p>{item.proposed_text}</p>
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <p>No recommendations returned.</p>
                )}
              </div>
            ))}
          </section>

          <section className="ra-panel">
            <h3>ATS Issues</h3>
            {analysis.ats_issues?.length ? (
              <ul>
                {analysis.ats_issues.map((issue, index) => (
                  <li key={`${issue}-${index}`}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p>No ATS issues returned.</p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export default ResumeAnalyzer;
