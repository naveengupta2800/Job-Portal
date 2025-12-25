import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./style.css";

export default function RecruiterProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");

  const [websiteError, setWebsiteError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    companyWebsite: "",
    phone: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  /* ================= HELPERS ================= */
  const isValidWebsite = (url) =>
    /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(url);

  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile/recruiter");

      setProfile(res.data.profile);
      setFormData({
        name: res.data.profile.name || "",
        email: res.data.profile.email || "",
        company: res.data.profile.company || "",
        companyWebsite: res.data.profile.companyWebsite || "",
        phone: res.data.profile.phone || "",
      });

      if (res.data.profile.profileImage) {
        setPreview(res.data.profile.profileImage);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Server error while fetching profile"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!profileImage) return;

    const fd = new FormData();
    fd.append("profileImage", profileImage);

    await api.post("/api/profile/recruiter/image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    try {
      setError("");
      setWebsiteError("");
      setPhoneError("");

      if (
        formData.companyWebsite &&
        !isValidWebsite(formData.companyWebsite)
      ) {
        setWebsiteError("Enter a valid website (eg: https://company.com)");
        return;
      }

      if (formData.phone && !isValidPhone(formData.phone)) {
        setPhoneError("Enter a valid 10-digit phone number");
        return;
      }

      let updatedData = { ...formData };
      if (
        updatedData.companyWebsite &&
        !updatedData.companyWebsite.startsWith("http")
      ) {
        updatedData.companyWebsite =
          "https://" + updatedData.companyWebsite;
      }

      await uploadImage();

      const res = await api.put("/api/profile/recruiter", updatedData);

      setProfile(res.data.profile);
      setEditing(false);
      setSuccess("Profile updated successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Profile update failed"
      );
    }
  };

  /* ================= UI ================= */
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="profile-container">
      {success && <div className="success-message">{success}</div>}

      {/* PROFILE IMAGE */}
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

      <h2>Recruiter</h2>

      {!editing ? (
        <>
          <div className="profile-item">
            <strong>Name:</strong> {profile.name}
          </div>
          <div className="profile-item">
            <strong>Email:</strong> {profile.email}
          </div>
          <div className="profile-item">
            <strong>Company:</strong> {profile.company}
          </div>
          <div className="profile-item">
            <strong>Company Website:</strong>{" "}
            {profile.companyWebsite || "—"}
          </div>
          <div className="profile-item">
            <strong>Phone:</strong> {profile.phone || "—"}
          </div>

          <button className="edit-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </>
      ) : (
        <div className="edit-form">
          <div className="form-item">
            <label>Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-item">
            <label>Email</label>
            <input name="email" value={formData.email} readOnly />
          </div>

          <div className="form-item">
            <label>Company</label>
            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="form-item">
            <label>Company Website</label>
            <input
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  companyWebsite: e.target.value,
                });
                setWebsiteError("");
              }}
              className={websiteError ? "input-error" : ""}
              placeholder="https://company.com"
            />
            {websiteError && (
              <div className="field-error-box">{websiteError}</div>
            )}
          </div>

          <div className="form-item">
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setPhoneError("");
              }}
              className={phoneError ? "input-error" : ""}
              placeholder="10-digit number"
            />
            {phoneError && (
              <div className="field-error-box">{phoneError}</div>
            )}
          </div>

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
