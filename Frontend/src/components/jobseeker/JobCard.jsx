import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./style.css";

export default function JobCard({ job, isSaved, onToggleSave }) {
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  useEffect(() => {
    if (job?._id) checkAlreadyApplied();
  }, [job]);

 const checkAlreadyApplied = async () => {
  try {
    const res = await api.get("/api/apply/me");

    const appliedJob = res.data.applications?.find(
      (app) => app.job?._id === job?._id
    );

    if (appliedJob) setApplied(true);
  } catch (err) {
    console.error("Error checking applied jobs:", err);
  }
};


  const handleApply = async (jobId) => {
  setApplying(true);

  try {
    await api.post(`/api/apply/${jobId}`);

    setApplied(true);
    alert("✅ Applied successfully");
  } catch (err) {
    alert(err.response?.data?.message || "Apply failed");
  } finally {
    setApplying(false);
  }
};


  return (
    <div className="job-card">
      <div className="job-meta">
        <div>
          <div
            className="job-title"
            onClick={() => navigate(`/job/${job?._id}`)}
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            {job?.title || "N/A"}
          </div>
          <div className="company">{job?.company || "N/A"}</div>
          <div className="job-info">
            <span>{job?.location || "N/A"}</span>
            <span>•</span>
            <span className="small">{job?.experience || "N/A"}</span>
          </div>
          <div className="job-tags">
            {job?.employmentType && <span className="job-tag">{job.employmentType}</span>}
            {job?.salary && <span className="job-tag">{job.salary}</span>}
            {job?.isRemote && <span className="job-tag">Remote</span>}
          </div>
        </div>
      </div>

      <div className="job-actions">
        <button
          className="btn primary"
          onClick={() => handleApply(job?._id)}
          disabled={applying || applied} 
        >
          {applied ? "Applied" : applying ? "Applying..." : "Apply"}
        </button>

        <button className="btn secondary" onClick={() => onToggleSave(job?._id)}>
          {isSaved ? "Unsaved" : "Save"}
        </button>
      </div>
    </div>
  );
}
