
import { useEffect, useMemo, useState } from "react";

function DiscoverJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [typeFilter, setTypeFilter] = useState("All types");

  async function fetchJobs() {
    try {
      setError("");
      setLoading(true);

      const response = await fetch("/api/discovered-jobs/");

      if (!response.ok) {
        throw new Error("Could not load jobs. Please try again.");
      }

      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  const locations = useMemo(
    () => [
      "All locations",
      ...new Set(jobs.map((job) => job.location).filter(Boolean)),
    ],
    [jobs]
  );

  const employmentTypes = useMemo(
    () => [
      "All types",
      ...new Set(jobs.map((job) => job.employment_type).filter(Boolean)),
    ],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [job.title, job.company, job.location, job.description]
          .some((value) => value?.toLowerCase().includes(query));

      const matchesLocation =
        locationFilter === "All locations" ||
        job.location === locationFilter;

      const matchesType =
        typeFilter === "All types" ||
        job.employment_type === typeFilter;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [jobs, search, locationFilter, typeFilter]);

  return (
    <main className="discover-page">
      <section className="discover-header">
        <div>
          <span className="discover-eyebrow">CAREER EXPLORER</span>
          <h1>Discover opportunities<span>.</span></h1>
          <p>
            Explore opportunities and find your next career move.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchJobs}
          disabled={loading}
        >
          <span>{loading ? "↻" : "⟳"}</span>
          {loading ? "Loading..." : "Refresh jobs"}
        </button>
      </section>

      <section className="discover-toolbar">
        <label className="search-box">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search job titles, companies, or skills..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <select
          aria-label="Filter by location"
          value={locationFilter}
          onChange={(event) => setLocationFilter(event.target.value)}
        >
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by employment type"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          {employmentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </section>

      <section className="discover-results">
        <div className="results-heading">
          <div>
            <h2>Available opportunities</h2>
            <p>Jobs collected from supported job sources</p>
          </div>

          {!loading && !error && (
            <span className="results-count">
              {filteredJobs.length} jobs
            </span>
          )}
        </div>

        {loading ? (
          <div className="discover-message">Loading opportunities...</div>
        ) : error ? (
          <div className="discover-message error-message">
            <p>{error}</p>
            <button onClick={fetchJobs}>Try again</button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="discover-message">
            <h3>No matching jobs found</h3>
            <p>Try another search or clear your filters.</p>
            <button
              onClick={() => {
                setSearch("");
                setLocationFilter("All locations");
                setTypeFilter("All types");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="job-grid">
            {filteredJobs.map((job) => (
              <article className="discovered-job-card" key={job.id}>
                <div className="job-card-top">
                  <div className="company-avatar">
                    {(job.company || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="source-label">
                    {job.source || "Job source"}
                  </span>
                </div>

                <h3>{job.title}</h3>
                <p className="job-company">{job.company}</p>

                <div className="job-meta">
                  <span>⌖ {job.location || "Location not specified"}</span>
                  {job.employment_type && (
                    <span>{job.employment_type}</span>
                  )}
                  {job.experience_level && (
                    <span>{job.experience_level}</span>
                  )}
                </div>

                <div className="job-card-footer">
                  <span className="job-date">
                    {job.posted_at
                      ? `Posted ${job.posted_at}`
                      : "Opportunity"}
                  </span>

                  <a
                    className="apply-button"
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View job <span>↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default DiscoverJobs;
