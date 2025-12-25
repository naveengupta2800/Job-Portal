import React from "react";
import "./style.css";

export default function SavedJobsPage({ jobs, onToggleSave, onApply }) {
  if (!jobs || jobs.length === 0) {
    return <p className="center muted">No saved jobs found.</p>;
  }

  return (
    <div className="saved-jobs-container">

      <div className="table-wrapper">
      <h2>Saved Jobs</h2>
        <table className="saved-jobs-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Type</th>
              <th>Posted On</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>
                  <strong>{job.title}</strong>
                </td>

                <td>{job.company || "N/A"}</td>

                <td>{job.location || "N/A"}</td>

                <td>{job.employmentType || "N/A"}</td>

                <td>
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>

                <td className="actions">

                  <button
                    className="btn danger"
                    onClick={() => onToggleSave(job._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
