import React, { useEffect, useState } from "react";
import SavedJobsPage from "./SavedJobsPage";
import api from "../utils/api";
import "./style.css";

export default function SavedJobsContainer({ onApply }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH SAVED JOBS (GET) ================= */
  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/save/saved");
      setSavedJobs(res.data.savedJobs || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Server error while fetching saved jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE / UNSAVE JOB (POST) ================= */
  const handleToggleSave = async (jobId) => {
    try {
      const isAlreadySaved = savedJobs.some((j) => j._id === jobId);
      const endpoint = `/api/save/${isAlreadySaved ? "unsave" : "save"}/${jobId}`;

      await api.post(endpoint);

      // 🔁 refresh list
      fetchSavedJobs();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Server error while updating saved job"
      );
    }
  };

  /* ================= UI ================= */
  if (loading) return <p>Loading saved jobs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <SavedJobsPage
      jobs={savedJobs}
      onToggleSave={handleToggleSave}
      onApply={onApply}
    />
  );
}
