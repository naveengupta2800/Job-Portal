import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import Navbar from "./components/jobseeker/Navbar";
import JobListingPage from "./components/jobseeker/JobListingPage";
import JobDetailsPage from "./components/jobseeker/JobDetailsPage";
import SavedJobsContainer from "./components/jobseeker/SavedJobsContainer";
import ProfilePage from "./components/jobseeker/ProfilePage";
import JobApply from "./components/jobseeker/JobApply";

import RecruiterSidebar from "./components/recruiter/RecruiterSidebar";
import Dashboard from "./components/recruiter/Dashboard";
import CreateJobForm from "./components/recruiter/CreateJobForm";
import MyJobListings from "./components/recruiter/MyJobListings";
import ApplicationsView from "./components/recruiter/ApplicationsView";
import RecruiterProfile from "./components/recruiter/Profile";

import api from "./components/utils/api";

/* ================= JOBSEEKER LAYOUT ================= */
const JobseekerLayout = ({ children, savedCount, onLogout }) => (
  <>
    <Navbar savedCount={savedCount} onLogout={onLogout} />
    <div className="jobseeker-content">{children}</div>
  </>
);

/* ================= RECRUITER LAYOUT ================= */
const RecruiterLayout = ({ onLogout, children }) => (
  <div className="recruiter-layout">
    <RecruiterSidebar onLogout={onLogout} />
    {children}
  </div>
);

/* ================= APP ================= */
function App() {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedCount, setSavedCount] = useState(0);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  /* ROLE CHECK */
  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    api
      .get("/api/auth/get-role")
      .then((res) => setUserRole(res.data.role))
      .catch(() => setUserRole(null))
      .finally(() => setLoading(false));
  }, [isAuthPage]);

  /* LOGOUT */
  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    setUserRole(null);
  };

  /* SAVED JOB COUNT */
  useEffect(() => {
    if (userRole !== "jobseeker") return;

    api
      .get("/api/save/saved")
      .then((res) => setSavedCount(res.data.totalJobs || 0))
      .catch(() => setSavedCount(0));
  }, [userRole]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <Routes>
      {/* AUTH */}
      <Route
        path="/login"
        element={
          userRole ? <Navigate to="/" /> : <Login setUserRole={setUserRole} />
        }
      />
      <Route
        path="/register"
        element={
          userRole ? <Navigate to="/" /> : <Register setUserRole={setUserRole} />
        }
      />

      {/* JOBSEEKER */}
      <Route
        path="/"
        element={
          userRole === "jobseeker" ? (
            <JobseekerLayout savedCount={savedCount} onLogout={handleLogout}>
              <JobListingPage />
            </JobseekerLayout>
          ) : userRole === "recruiter" ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/job/:id"
        element={
          userRole === "jobseeker" ? (
            <JobseekerLayout savedCount={savedCount} onLogout={handleLogout}>
              <JobDetailsPage />
            </JobseekerLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/saved"
        element={
          userRole === "jobseeker" ? (
            <JobseekerLayout savedCount={savedCount} onLogout={handleLogout}>
              <SavedJobsContainer />
            </JobseekerLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/profile"
        element={
          userRole === "jobseeker" ? (
            <JobseekerLayout savedCount={savedCount} onLogout={handleLogout}>
              <ProfilePage />
            </JobseekerLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/applied"
        element={
          userRole === "jobseeker" ? (
            <JobseekerLayout savedCount={savedCount} onLogout={handleLogout}>
              <JobApply />
            </JobseekerLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* RECRUITER */}
      <Route
        path="/dashboard"
        element={
          userRole === "recruiter" ? (
            <RecruiterLayout onLogout={handleLogout}>
              <Dashboard />
            </RecruiterLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/create-job"
        element={
          userRole === "recruiter" ? (
            <RecruiterLayout onLogout={handleLogout}>
              <CreateJobForm />
            </RecruiterLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/my-jobs"
        element={
          userRole === "recruiter" ? (
            <RecruiterLayout onLogout={handleLogout}>
              <MyJobListings />
            </RecruiterLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/applications"
        element={
          userRole === "recruiter" ? (
            <RecruiterLayout onLogout={handleLogout}>
              <ApplicationsView />
            </RecruiterLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/recruiter/profile"
        element={
          userRole === "recruiter" ? (
            <RecruiterLayout onLogout={handleLogout}>
              <RecruiterProfile />
            </RecruiterLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

/* ================= WRAPPER ================= */
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
