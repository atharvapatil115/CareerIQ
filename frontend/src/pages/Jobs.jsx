
import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";


const initialFormData = {
  company: "",
  job_role: "",
  location: "",
  salary: "",
  status: "APPLIED",
  date_applied: "",
  notes: "",
};

function Jobs() {
  // Get the logged-in user's JWT token from AuthContext.
  const { token } = useAuth();

  // Store jobs returned by the backend.
  const [jobs, setJobs] = useState([]);

  // Track whether the API request is still running.
  const [loading, setLoading] = useState(true);

  // Store any error returned by the API or network.
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState("");

  const [deletingJobId, setDeletingJobId] = useState(null);

  const [deleteError, setDeleteError] = useState("");

  const [editingJobId, setEditingJobId] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/jobs/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch jobs. Please try again.");
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchJobs();
    } else {
      setError("You are not logged in.");
      setLoading(false);
    }
  }, [token]);

  function formatSalary(salary) {
    if (salary == null) return "Not specified";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(salary);
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setFormError("");

    const salaryText = String(formData.salary ?? "").trim();

    const payload = {
      ...formData,
      salary: salaryText === "" ? null : Number(salaryText),
      date_applied: formData.date_applied || null,
    };

    try {
      const isEditing = editingJobId !== null;

      const url = isEditing
        ? `/api/jobs/${editingJobId}`
        : "/api/jobs/";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const createdJob = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = createdJob?.detail;

        throw new Error(
          typeof detail === "string"
            ? detail
            : "Could not create the job. Check the entered details."
        );
      }

      if (!createdJob || createdJob.id == null) {
        throw new Error(
          "The job may have been saved, but the API did not return the created job as expected. Refresh the page to check."
        );
      }

      if (isEditing) {
        setJobs((previousJobs) =>
          previousJobs.map((job) =>
            job.id === editingJobId ? createdJob : job
          )
        );
      } else {
        setJobs((previousJobs) => [createdJob, ...previousJobs]);
      }

      setFormData(initialFormData);
      setEditingJobId(null);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(jobId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingJobId(jobId);
    setDeleteError("");

    try {
      const response = await fetch(
        `/api/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Failed to delete the application."
        );
      }

      setJobs((previousJobs) =>
        previousJobs.filter((job) => job.id !== jobId)
      );
    } catch (err) {
      setDeleteError(err.message || "Something went wrong.");
    } finally {
      setDeletingJobId(null);
    }
  }

  function handleEdit(job) {
    setEditingJobId(job.id);

    setFormData({
      company: job.company,
      job_role: job.job_role,
      location: job.location,
      salary: job.salary ?? "",
      status: job.status,
      date_applied: job.date_applied ?? "",
      notes: job.notes ?? "",
    });

    setFormError("");
    setShowForm(true);
  }

  if (loading) {
    return <p>Loading your jobs...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <section className="jobs-page">
      <div className="jobs-page-header">
        <div>
          <h1>My Applications</h1>
          <p>Track and manage all your job applications.</p>
        </div>

        <span className="jobs-count">
          {jobs.length} Applications
        </span>
        <button
          type="button"
          className="add-job-button"
          onClick={() => setShowForm((previous) => !previous)}
        >
          {showForm ? "Cancel" : "+ Add Job"}
        </button>
      </div>
      {showForm && (
        <form className="job-form" onSubmit={handleSubmit}>
          <h2>
            {editingJobId !== null
              ? "Edit Job Application"
              : "Add a Job Application"}
          </h2>

          {formError && (
            <p className="error-message">{formError}</p>
          )}

          <div className="job-form-grid">
            <label>
              Company *
              <input
                name="company"
                value={formData.company}
                onChange={handleFormChange}
                required
                maxLength={100}
                placeholder="e.g. Microsoft"
              />
            </label>

            <label>
              Job Role *
              <input
                name="job_role"
                value={formData.job_role}
                onChange={handleFormChange}
                required
                maxLength={100}
                placeholder="e.g. Backend Developer"
              />
            </label>

            <label>
              Location *
              <input
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                required
                maxLength={100}
                placeholder="e.g. Pune"
              />
            </label>

            <label>
              Annual Salary (₹)
              <input
                name="salary"
                type="number"
                min="0"
                step="1"
                value={formData.salary}
                onChange={handleFormChange}
                placeholder="e.g. 450000"
              />
            </label>

            <label>
              Application Status *
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
              >
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </label>

            <label>
              Application Date
              <input
                type="date"
                name="date_applied"
                value={formData.date_applied}
                onChange={handleFormChange}
              />
            </label>

            <label className="job-form-full">
              Notes
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Anything worth remembering about this application?"
                rows={3}
              />
            </label>
          </div>

          <button
            type="submit"
            className="add-job-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingJobId !== null
                ? "Update Application"
                : "Save Application"}
          </button>
        </form>
      )}


      {jobs.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Your job applications will appear here.</p>
        </div>
      ) : (
        <>
          {/* Desktop: existing table */}
          <div className="jobs-table-container desktop-jobs-table">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Role</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="company-name">{job.company}</td>
                    <td>{job.job_role}</td>
                    <td>{job.location}</td>
                    <td>{formatSalary(job.salary)}</td>
                    <td>
                      <span
                        className={`status-badge status-${job.status.toLowerCase()}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td>{formatDate(job.date_applied)}</td>
                    <td>{job.notes || "—"}</td>
                    <td>
                      <div className="job-card-actions">
                        <button
                          type="button"
                          className="edit-job-button"
                          onClick={() => handleEdit(job)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-job-button"
                          onClick={() => handleDelete(job.id)}
                          disabled={deletingJobId === job.id}
                        >
                          {deletingJobId === job.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: application cards */}
          <div className="mobile-job-cards">
            {jobs.map((job) => (
              <article className="mobile-job-card" key={job.id}>
                <div className="mobile-job-card-header">
                  <div>
                    <h3>{job.company}</h3>
                    <p>{job.job_role}</p>
                  </div>

                  <span
                    className={`status-badge status-${job.status.toLowerCase()}`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="mobile-job-details">
                  <div>
                    <span>Location</span>
                    <strong>{job.location || "Not specified"}</strong>
                  </div>

                  <div>
                    <span>Salary</span>
                    <strong>{formatSalary(job.salary)}</strong>
                  </div>

                  <div>
                    <span>Applied on</span>
                    <strong>{formatDate(job.date_applied)}</strong>
                  </div>
                </div>

                {job.notes && (
                  <div className="mobile-job-notes">
                    <span>Notes</span>
                    <p>{job.notes}</p>
                  </div>
                )}

                <div className="job-card-actions">
                  <button
                    type="button"
                    className="edit-job-button"
                    onClick={() => handleEdit(job)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-job-button"
                    onClick={() => handleDelete(job.id)}
                    disabled={deletingJobId === job.id}
                  >
                    {deletingJobId === job.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

    </section>
  );
}

export default Jobs;
