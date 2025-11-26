const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const nodemailer = require('nodemailer');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT;

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false,
      maxAge: 24 * 60 * 60 * 1000
     }, //secure:true when using https
  })
);

// MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('DB Error:', err));


// USER SCHEMA
const userSchema = new mongoose.Schema({
  name: String, 
  password: String,  
  email: { type: String, unique: true },
  role: { type: String, enum:['jobseeker', 'recruiter'], required: true },

  otp: String,
  otpExpire: Date,
  isVerified: { type: Boolean, default: false },

  //profile user
  phone:String,
  address:String,
  skills: [String],
  education : [
    {
      school:String,
      degree: String,
      year: String,
    }
  ],
  experience: [
    {
      company: String,
      title: String,
      years: String
    }
  ],
  company:String,
  companyWebsite:String,
  totalJobsPosted: { type: Number, default: 0 }
 },
 {
  timestamps: true 
});
const User = mongoose.model('User', userSchema);

const JobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  company: { type: String, required: true },
  salary: { type: String },
  experience:{type: String},
  skillsRequired: { type: [String], required: true },
  employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Internship', 'Remote', 'Contract'], required: true },
  createdAt: { type: Date, default: Date.now }
},{timestamps:true});

const Job = mongoose.model("Job", JobSchema);


// Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

//-------------------------Auth Routes---------------------------------------
// REGISTER API
app.post('/register', async(req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    if (!['jobseeker', 'recruiter'].includes(role))
      return res.status(400).json({ message: 'Invalid role selected' });

    // Check email exists
    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10*60*1000); 

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpire,
    });

    req.session.email = email;
    await user.save();

    // Send OTP
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP is ${otp}`,
    });

   return res.json({ message: 'User registered, OTP sent' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// VERIFY OTP
app.post('/verify', async (req, res) => {
  try {
    const { otp } = req.body;

    if(!otp) 
      return res.status(400).json({message: 'OTP is required'});
    const email = req.session.email;

    if (!email) return res.status(400).json({ message: 'Session expired' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (user.otpExpire && user.otpExpire < new Date())
      return res.status(400).json({ message: 'OTP expired. Please register again.' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// LOGIN
app.post('/login', async(req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email & Password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    req.session.token = token;
    req.session.userId = user.id;

    req.session.save((err) => {
      if (err) {
        console.log("Session save error:", err);
        return res.status(500).json({ message: "Session save failed" });
      }

      res.json({
        message: 'Logged in successfully'
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/profile/jobseeker',async(req,res)=> {
  try {
      const token = req.session.token;
      if(!token){
        return res.status(401).json({message: 'Unautorized user'});
      }
      const decoded = jwt.verify(token,JWT_SECRET);
      
        const user = await User.findById(decoded.userId).select('-password -otp -otpExpire');
          if(!user) {
            return res.status(404).json({message :'User not found'});
          };
          if(user.role!=='jobseeker'){
            return res.status(403).json({message:'"Only jobseekers can access profile'})
          };
          return res.json({
          message :'Profile fetched successfully',
          profile :{

          name:user.name,
          email:user.email,
          role:user.role,
          phone: user.phone|| null,
          address: user.address|| null,
          skills: user.skills|| [],
          education: user.education || [],
          experience: user.experience || []
          }
         });
  }
        catch(err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
  }
});
app.put('/profile/jobseeker/update', async(req,res) => {
  try {
    const token = req.session.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId).select('-password -otp -otpExpire');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only jobseekers can access profile' });
    }

    const allowed = ['name', 'phone', 'address', 'skills', 'education', 'experience'];
    const updates = {};

    for (const key in req.body) {
      if (allowed.includes(key)) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select('-password -otp -otpExpire');

    res.json({ message: 'Profile updated successfully', profile: updatedUser });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
app.get('/profile/recruiter',async(req,res)=> {
    try{
        const token = req.session.token;
        if(!token){       //Pehle check karta hai user login hai ya nahi
          return res.status(401).json({ messaage:'Unauthorized user' });
        }
        const decoded= jwt.verify(token,JWT_SECRET); // Fir JWT token decode karta hai
        const user = await User.findById(decoded.userId).select("-password -otp -otpExpire");  //Fir JWT token decode karta hai
        if(!user){ //Fir agar user exist nahi hai to error deta hai
          return res.status(404).json({message:"Recuiter not found"});
        }
        if(user.role!=="recruiter"){
          return res.status(403).json({message:'Access Denied, not a recruiter'});
        }
       return res.json({
        message: 'Recruiter Fetched successfully',
        profile: {
          name: user.name,
          email:user.email,
          phone:user.phone||null,
          company:user.company || null,
          companyWebsite: user.companyWebsite || null,
          address: user.address|| null,
          role:user.role || null,
          createdAt: user.createdAt || null,
          totalJobsPosted: user.totalJobsPosted || null
        }
       });
    }
    catch(err){
      console.log(err);
      return res.status(500).json({message:'Server error'});
    }
})
app.put('/profile/recruiter/update',async(req,res)=> {
   try{
  
        const token = req.session.token;
        if(!token){       //Pehle check karta hai user login hai ya nahi
          return res.status(401).json({ messaage:'Unauthorized user' });
        }
        const decoded= jwt.verify(token,JWT_SECRET); // Fir JWT token decode karta hai
        const user = await User.findById(decoded.userId).select("-password -otp -otpExpire");  //Fir JWT token decode karta hai
        if(!user){ //Fir agar user exist nahi hai to error deta hai
          return res.status(404).json({message:"Recuiter not found"});
        }
        if(user.role!=="recruiter"){
          return res.status(403).json({message:'Access Denied, not a recruiter'});
        }
        const allowed = ['name','email','phone','company','companyWebsite','address','totalJobsPosted']

        const updates= {};
        for(const key in req.body){
          if(allowed.includes(key)) {
            updates[key] = req.body[key];
          }
        }
        const updatedUser = await User.findByIdAndUpdate(decoded.userId,
          {$set:updates},
          {new: true}
        ).select("-password -otp -otpExpire");
        res.json({message: 'Profile updated successfully', profile: updatedUser})
      }
  
  catch(err){
    console.log(err);
    return res.status(500).json({message:'Server error'});
  }
});
app.post('/job/create',async(req,res)=> {
  try {
     const token = req.session.token;
        if(!token){       
          return res.status(401).json({ messaage:'Unauthorized user' });
        }
        const decoded= jwt.verify(token,JWT_SECRET); 
        const user = await User.findById(decoded.userId).select("-password -otp -otpExpire");
        if(!user){
          return res.status(404).json({message:"User not found"});
        }
        if(user.role!=="recruiter"){
          return res.status(403).json({message:'Access Denied, recruiter can post jobs'});
        }
        const{title,description,location,company,salary,experience,skillsRequired,employmentType} = req.body;
        
        if(!title || !description){
          return res.status(400).json({message:'Title and Description are required'});
        }
        if(!company || !location){
          return res.status(400).json({message:'Company and Location are required'});
        }
        
        const newJob = new Job({
          recruiterId: user._id,
          title,
          description,
          location,
          company,
          salary,
          experience,
          skillsRequired,
          employmentType
        });
        await newJob.save();
      res.status(201).json({
      message: 'Job created successfully',
      job: newJob })
      }
      catch(err){
        console.log(err);
        return res.status(500).json({message:'Internal Server error'});
      }
  
});
app.get('/job/all', async(req,res)=> {
  try {
    const token = req.session.token;
    if(!token){
      return res.status(401).json({ messaage:'Unauthorized user' });
    } 
    const decoded = jwt.verify(token,JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password -otp -otpExpire");
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    const jobs = await Job.find();
    return res.json({
      message:" See All Jobs ",
      totalJobs:jobs.length,
      jobs:jobs
    });
  }
  catch(err){
    console.log(err);
    return res.status(500).json({message:"Server error"});
  }
});
app.put('/jobs/update/:jobId',async(req,res)=> {
  try {
    const token = req.session.token;
    if(!token){
      return res.status(401).json({
        message:"Unautorized User"
      });
    }
    const decoded = jwt.verify(token,JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password -otp -otpExpire");
    if(!user) { return res.status(404).json({message: "User not found"});
  }
  if(user.role !== "recruiter") {
     return res.status(403).json({message:'Access Denied, not a recruiter'});
  }
  const jobId = req.params.jobId;
    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }
    const allowed = ['title','description','location','company','salary','experience','skillsRequired','employmentType'];
    const updates = {};
    for(const key in req.body){
      if(allowed.includes(key)){
        updates[key] = req.body[key];
      }
    }
      const UpdateJob = await Job.findByIdAndUpdate(jobId,{$set:updates},
        {new:true}
      );
      if (!UpdateJob) {
      return res.status(404).json({ message: "Job not found" });
    }
      res.json({message:'Job Update Successfully',
         UpdateJob
      })
    }
  catch(err){
    console.log(err);
    return res.status(500).json({message:"Server error"});
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
