import React, { useEffect, useState, useMemo } from "react";
import JobCard from "./JobCard.jsx";
import api from "../utils/api";
import "./style.css";

export default function JobListingPage() {
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  // ✅ GET: all jobs
  const fetchJobs = async () => {
    try {
      const res = await api.get("/api/jobs/all");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.log("Fetch jobs error:", err);
    }
  };

  // ✅ GET: saved jobs
  const fetchSavedJobs = async () => {
    try {
      const res = await api.get("/api/save/saved");
      setSavedJobIds(res.data.savedJobs.map(job => job._id));
    } catch (err) {
      console.log("Fetch saved jobs error:", err);
    }
  };

  // ✅ POST: save / unsave job
  const handleToggleSave = async (jobId) => {
    try {
      const isSaved = savedJobIds.includes(jobId);
      const endpoint = `/api/save/${isSaved ? "unsave" : "save"}/${jobId}`;

      await api.post(endpoint);

      setSavedJobIds(prev =>
        isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId]
      );
    } catch (err) {
      alert(err.response?.data?.message || "Server error while updating saved jobs");
    }
  };

  const filteredJobs = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
  }, [jobs, keyword]);

  return (
    <div className="container">
      <div className="header-row">
        <h2>Explore Jobs</h2>
        <input
          className="input"
          placeholder="Filter by keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      <div className="grid">
        {filteredJobs.length ? (
          filteredJobs.map(job => (
            <JobCard
              key={job._id}
              job={job}
              isSaved={savedJobIds.includes(job._id)}
              onToggleSave={handleToggleSave}
            />
          ))
        ) : (
          <div className="empty">No jobs found.</div>
        )}
      </div>
    </div>
  );
}
