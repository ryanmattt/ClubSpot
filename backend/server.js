require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PORT = 3009;
const app = express();

app.use(cors({
    origin: "0.0.0.0/0",  // The frontend origin
    credentials: true,               // Allow credentials (cookies, headers)
    methods: ["GET", "POST", "PUT", "DELETE"],  // Allow specific HTTP methods
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// User Schema
const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true }],
  board_groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true }],
  site_admin: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

// Group Schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  photoUrl: { type: String, required: false },
  // here for the groups----------------------------------------------------------------------Martin!
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Array of Post references
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of User references
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of User references (admins)
});

const Group = mongoose.model("Group", groupSchema);

// Post Schema
const postSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  isEvent: { type: Boolean, required: true },
  date: { type: Date, required: false },
  location: { type: String, required: false },
  photoUrl: { type: String, required: false }, // 'photo-url' field
    username: { type: String, required: true },
});

const Post = mongoose.model("Post", postSchema);

// Routes


// Middleware to verify token (authentication)
const authenticate = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).send({ message: "Invalid token." });
  }
};

// Register a new user
app.post("/api/auth/register", async (req, res) => {
  const { username, displayName, password } = req.body;
    console.log("Register route hit");

  if (!username || !displayName || !password) {
    return res.status(400).send({ message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      displayName,
      password: hashedPassword,
      groups: [],
      board_groups: [],
      site_admin: false,
    });

    await newUser.save();
    res.status(201).send({ message: "User registered successfully." });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send({ message: "Username already exists." });
    } else {
      res.status(500).send({ message: "Error registering user." });
    }
  }
});

// Login (set JWT token as a cookie)
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
    console.log("Login route hit");
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id, username: user.username, displayName: user.displayName }, JWT_SECRET, { expiresIn: "1d" });
    // Set the token as a secure, HTTP-only cookie
    res.cookie("authToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 86400000 }); // expires in 1 day
    res.status(200).send({ message: "Login successful." });
  } catch (err) {
    res.status(500).send({ message: "Error logging in." });
  }
});


// Verify token
app.post("/api/auth/verify", (req, res) => {
  const token = req.cookies.authToken; // Extract the token from the cookie

  console.log("Token from cookie:", token);

  if (!token) {
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Decode the token using JWT_SECRET

    // Extract data from the decoded token
    const { id, username, displayName } = decoded;

    // Send the user data back to the client
    res.status(200).send({ id, username, displayName });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).send({ message: "Invalid token." });
  }
});


//logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  }); // Clear the cookie
  res.status(200).send({ message: "Logout successful." });
});


// Create a post
app.post("/api/posts", async (req, res) => {
  const { name, description, group, isEvent, date, location, photoUrl, username } = req.body;

  if (!name || !group || !isEvent || !username) {
    return res.status(400).send({ message: "Name, group, and event status are required." });
  }

  try {
    const newPost = new Post({
      name,
      description,
      group,
      isEvent,
      date,
      location,
      photoUrl,
      username
    });

    await newPost.save();
    res.status(201).send({ message: "Post created successfully.", post: newPost });
  } catch (err) {
    res.status(500).send({ message: "Error creating post." });
  }
});

// Create a group
app.post("/api/groups", async (req, res) => {
  const { name, description, photoUrl, members, admins } = req.body;

  if (!name || !description) {
    return res.status(400).send({ message: "Name and description are required." });
  }

  try {
    const newGroup = new Group({
      name,
      description,
      photoUrl,
      members,  // Array of User IDs
      admins,   // Array of User IDs
    });

    await newGroup.save();
    res.status(201).send({ message: "Group created successfully.", group: newGroup });
  } catch (err) {
    res.status(500).send({ message: "Error creating group." });
  }
});

// Get the list of groups a user is in
app.get("/api/groups/user", authenticate, async (req, res) => {
  console.log("User groups route hit");
  try {
    const userId = req.user.id; // from the decoded token
    const user = await User.findById(userId).populate('groups'); // Populate to get group details
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    res.status(200).send({ groups: user.groups });
  } catch (err) {
    res.status(500).send({ message: "Error fetching groups." });
  }
});


// Join a group
app.post("/api/groups/join", authenticate, async (req, res) => {
  const { groupId } = req.body; // groupId passed from frontend
  
  if (!groupId) {
    return res.status(400).send({ message: "Group ID is required." });
  }

  try {
    const userId = req.user.id; // Get the user ID from the token
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }

    // Check if the user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).send({ message: "User is already a member of this group." });
    }

    // Add user to group
    group.members.push(userId);
    await group.save();

    // Add group to user's list of groups
    const user = await User.findById(userId);
    user.groups.push(groupId);
    await user.save();

    res.status(200).send({ message: "User joined the group successfully." });
  } catch (err) {
    res.status(500).send({ message: "Error joining group." });
  }
});


// Create a group
app.post("/api/groups/create", authenticate, async (req, res) => {
  const { name, description, photoUrl } = req.body;

  if (!name || !description) {
    return res.status(400).send({ message: "Name and description are required." });
  }

  try {
    const userId = req.user.id; // Get user ID from token

    const newGroup = new Group({
      name,
      description,
      photoUrl,
      members: [userId], // Add the current user as a member
      admins: [userId],  // Optionally, you can add the user as the admin
    });

    await newGroup.save();

    // Add the newly created group to the user's groups
    const user = await User.findById(userId);
    user.groups.push(newGroup._id);
    await user.save();

    res.status(201).send({ message: "Group created successfully.", group: newGroup });
  } catch (err) {
    res.status(500).send({ message: "Error creating group." });
  }
});

// Get all groups
app.get("/api/groups", async (req, res) => {
  try {
    const groups = await Group.find(); // Fetch all groups from the database
    res.status(200).send({ groups });
  } catch (err) {
    res.status(500).send({ message: "Error fetching groups." });
  }
});


// Profile route (example route)
app.get("/profile", (req, res) => {
  console.log("Profile route hit");
  res.send("Profile page");
});
