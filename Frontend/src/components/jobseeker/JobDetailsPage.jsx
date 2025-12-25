import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import "./style.css";

export default function JobDetailsPage({ savedJobIds = [], onToggleSave }) {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      checkAlreadyApplied();
    }
  }, [id]);

  // ✅ GET job details
  const fetchJob = async () => {
    try {
      const res = await api.get(`/api/jobs/${id}`);
      setJob(res.data.job);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch job");
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET applied jobs
  const checkAlreadyApplied = async () => {
    try {
      const res = await api.get("/api/apply/me");

      const appliedJob = res.data.applications?.find(
        (app) => app.job?._id === id
      );

      if (appliedJob) setApplied(true);
    } catch (err) {
      console.error("Error checking applied jobs:", err);
    }
  };

  // ✅ POST apply job
  const handleApply = async (jobId) => {
    setApplying(true);
    try {
      await api.post(`/api/apply/${jobId}`);
      setApplied(true);
      alert("Applied successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Apply failed");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!job) return <p>Job not found</p>;

  const isSaved = savedJobIds.map(String).includes(job?._id?.toString());

  return (
    <div className="container">
      <div className="job-details">
        <h2>{job?.title || "N/A"}</h2>
        <p className="job-id">Job ID: {job?._id || "N/A"}</p>
        <p><b>Company:</b> {job?.company || "N/A"}</p>
        <p><b>Location:</b> {job?.location || "N/A"}</p>
        <p><b>Description:</b> {job?.description || "N/A"}</p>

        {job?.skillsRequired?.length > 0 && (
          <p><b>Skills Required:</b> {job.skillsRequired.join(", ")}</p>
        )}

        {job?.responsibility?.length > 0 && (
          <p><b>Responsibilities:</b> {job.responsibility.join(", ")}</p>
        )}

        <p><b>Experience:</b> {job?.experience || "N/A"}</p>
        <p><b>Employment Type:</b> {job?.employmentType || "N/A"}</p>
        <p><b>Salary:</b> {job?.salary || "N/A"}</p>

        <div className="job-actions">
          <button
            className="btn primary"
            onClick={() => handleApply(job?._id)}
            disabled={applying || applied}
          >
            {applied ? "Applied" : applying ? "Applying..." : "Apply"}
          </button>

          <button
            className="btn secondary"
            onClick={() => onToggleSave(job?._id)}
          >
            {isSaved ? "Unsaved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
