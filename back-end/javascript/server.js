// Import required modules
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from "cors";
import MongoStore from "connect-mongo";
import session from "express-session";
import rateLimit from "express-rate-limit";

import "./chatRespons.js";

// Initialize express app
const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your client's origin
    credentials: true, // Allow credentials (cookies, sessions)
  })
);

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB URL - Consider using environment variables for this
const url = "mongodb://127.0.0.1:27017/mymental";

// Connect to MongoDB using Mongoose
mongoose
  .connect(url)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Define a schema for the user
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  phone: String, // Added phone field
});

// Create a model based on the schema
const User = mongoose.model("User", userSchema);

// Define a schema for sessions
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sessionId: String,
  messages: [
    {
      text: String,
      response: String, // Response from GPT
      timestamp: Date,
    },
  ],
});

// Create a model for sessions
const SessionModel = mongoose.model("Session", sessionSchema);

// Create a MongoStore instance for session management
const sessionStore = MongoStore.create({ mongoUrl: url });

// Middleware for session management

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  response: String, // Add this field to capture the chatbot response
  timestamp: Date,
  session_id: String, // New field to store the session ID
});

const Chat = mongoose.model("Chat", chatSchema);

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 3 login requests per windowMs
  message:
    "Too many login attempts from this IP, please try again after 1 minute",
});

// Handle send

// Handle sending messages to the chatbot
app.post("/chat/send", async (req, res) => {
  try {
    const { message } = req.body;
    const sessionId = req.session.id;
    console.log("session ID:", sessionId); // Add this line to log the session ID
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    // Get the GPT response for the user message
    const gptResponse = await getGptResponse(message);

    // Store the user's question, chatbot's response, and session ID in the database
    const chat = new Chat({
      user: userId,
      message: message,
      response: gptResponse,
      timestamp: new Date(),
      session_id: sessionId,
    });

    await chat.save();

    res.status(200).send("Message sent successfully");
  } catch (error) {
    res.status(500).send("Error sending message: " + error.message);
  }
});

app.get("/chat/history", async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.session.userId }).sort({
      timestamp: 1,
    });
    res.json(chats);
  } catch (error) {
    res.status(500).send("Error retrieving chat history");
  }
});

// Serve static files from the 'public' directory
app.use(express.static("."));

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, repeatPassword, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    if (password !== repeatPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
    });
    await newUser.save();

    req.session.userId = newUser._id;
    res.json({
      success: true,
      message: "Signup successful",
      sessionId: req.sessionID,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error during signup" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.session.userId = user._id;
    req.session.username = user.username; // Optional
    res.json({
      success: true,
      message: "Login successful",
      sessionId: req.sessionID,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
});
// Home route
app.get("/", (req, res) => {
  if (!req.session.userId) {
    res.redirect("/index.html");
  } else {
    res.redirect("/base.html");
  }
});

const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Serve base.html only to authenticated users
app.get("/base.html", requireAuth, (req, res) => {
  res.sendFile(__dirname + "/base.html");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Listening on PORT ${port}`);
});
