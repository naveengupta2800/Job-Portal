import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../utils/api";
import "./style.css";

export default function JobseekerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    skills: "",
    education: [],
    experience: [],
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");

  /* ================= FETCH PROFILE (GET) ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/profile/jobseeker");
        const data = res.data;

        setProfile(data.profile);
        setFormData({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          skills: data.profile.skills?.join(", ") || "",
          education: data.profile.education || [],
          experience: data.profile.experience || [],
        });

        if (data.profile.profileImage) {
          setPreview(
            `${import.meta.env.VITE_API_URL}${data.profile.profileImage}`
          );
        }

        if (data.profile.resume) {
          setResumeName(data.profile.resume.split("/").pop());
        }
      } catch (err) {
        setMessage("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setResumeFile(file);
    if (file) setResumeName(file.name);
  };

  /* ================= UPLOADS (POST) ================= */
  const uploadImage = async () => {
    if (!profileImage) return;
    const fd = new FormData();
    fd.append("profileImage", profileImage);
    await api.post("/api/profile/jobseeker/image", fd);
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    const fd = new FormData();
    fd.append("resume", resumeFile);
    await api.post("/api/profile/jobseeker/resume", fd);
  };

  /* ================= DRAG & DROP ================= */
  const handleDragEnd = (result, field) => {
    if (!result.destination) return;
    const items = Array.from(formData[field]);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setFormData({ ...formData, [field]: items });
  };

  const handleAddItem = (field) => {
    const newItem =
      field === "education"
        ? { school: "", degree: "", year: "" }
        : { company: "", title: "", years: "" };

    setFormData({ ...formData, [field]: [...formData[field], newItem] });
  };

  const handleItemChange = (field, index, key, value) => {
    const items = [...formData[field]];
    items[index][key] = value;
    setFormData({ ...formData, [field]: items });
  };

  const handleRemoveItem = (field, index) => {
    const items = [...formData[field]];
    items.splice(index, 1);
    setFormData({ ...formData, [field]: items });
  };

  /* ================= SAVE PROFILE (PUT) ================= */
  const handleSave = async () => {
    try {
      setMessage("");

      await uploadImage();
      await uploadResume();

      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        skills: formData.skills.split(",").map((s) => s.trim()),
        education: formData.education,
        experience: formData.experience,
      };

      const res = await api.put("/api/profile/jobseeker", payload);

      setProfile(res.data.profile);
      setEditing(false);
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage("Profile update failed");
    }
  };

  /* ================= UI ================= */
  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>No profile found</p>;

  return (
    <div className="profile-container">
      {message && <p className="info-message">{message}</p>}

      <div className="image-section">
        <img
          src={preview || "/default-avatar.png"}
          alt="Profile"
          className="profile-img"
        />
        {editing && (
          <input type="file" accept="image/*" onChange={handleImageChange} />
        )}
      </div>

      <h2>Jobseeker Profile</h2>

      {!editing ? (
        <>
          <p><b>Name:</b> {profile.name}</p>
          <p><b>Email:</b> {profile.email}</p>
          <p><b>Phone:</b> {profile.phone}</p>
          <p><b>Address:</b> {profile.address}</p>
          <p><b>Skills:</b> {profile.skills?.join(", ")}</p>

          {profile.resume && (
            <a
              href={`${import.meta.env.VITE_API_URL}${profile.resume}`}
              target="_blank"
              rel="noreferrer"
            >
              📄 View Resume
            </a>
          )}

          <button className="edit-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </>
      ) : (
        <div className="edit-form">
          <input name="name" value={formData.name} onChange={handleChange} />
          <input name="phone" value={formData.phone} onChange={handleChange} />
          <input name="address" value={formData.address} onChange={handleChange} />
          <input name="skills" value={formData.skills} onChange={handleChange} />

          <input type="file" onChange={handleResumeChange} />

          <div className="form-buttons">
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
