require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = 3009;

app.use(cors({
    origin: "*",  // The frontend origin
    credentials: true,               // Allow credentials (cookies, headers)
    methods: ["GET", "POST", "PUT", "DELETE"],  // Allow specific HTTP methods
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

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
  groups: [String],
  board_groups: [String],
  site_admin: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

// Group Schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  photoUrl: { type: String, required: false },
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
});

const Post = mongoose.model("Post", postSchema);

// Routes

// Register a new user
app.post("/api/auth/register", async (req, res) => {
  const { username, displayName, password } = req.body;

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

// Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
    res.status(200).send({ token });
  } catch (err) {
    res.status(500).send({ message: "Error logging in." });
  }
});

// Verify token
app.post("/api/auth/verify", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).send(decoded);
  } catch (err) {
    res.status(401).send({ message: "Invalid token." });
  }
});

// Create a post
app.post("/api/posts", async (req, res) => {
  const { name, description, group, isEvent, date, location, photoUrl } = req.body;

  if (!name || !group || !isEvent) {
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

// Profile route (example route)
app.get("/profile", (req, res) => {
  console.log("Profile route hit");
  res.send("Profile page");
});

// Middleware to verify token (authentication)
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Assume token is sent as 'Bearer <token>'

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

// Protected route example
app.get("/api/protected", authenticate, (req, res) => {
  res.status(200).send({ message: "This is a protected route.", user: req.user });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
