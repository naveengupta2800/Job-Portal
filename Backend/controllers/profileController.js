const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    let profileData = {};

    if (user.role === "recruiter") {
      profileData = {
        name: user.name,
        email: user.email,
        company: user.company,
        companyWebsite: user.companyWebsite,
        phone: user.phone,
        profileImage: user.profileImage || null, 
      };
    } else if (user.role === "jobseeker") {
      profileData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        profileImage: user.profileImage || null,
         resume: user.resume || null   
      };
    }

    res.json({ profile: profileData });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

 
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let updates = {};

    if (user.role === "recruiter") {
      const fields = ["name", "company", "companyWebsite", "phone"];
      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    } else if (user.role === "jobseeker") {
      const fields = [
        "name",
        "phone",
        "address",
        "skills",
        "education",
        "experience",
      ];
      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      profile: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        company: updatedUser.company,
        companyWebsite: updatedUser.companyWebsite,
        address: updatedUser.address,
        skills: updatedUser.skills,
        education: updatedUser.education,
        experience: updatedUser.experience,
        profileImage: updatedUser.profileImage || null,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // save image path
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Profile image uploaded successfully",
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume uploaded" });
    }

    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.resume = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Resume uploaded successfully",
      resume: user.resume,
    });
  } catch (err) {
    console.error("Upload resume error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

