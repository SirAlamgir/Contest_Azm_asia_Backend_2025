const express = require("express");
const dns = require("dns");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGOOS_URI;

async function connectToMongoDB() {
  try {
    await mongoose.connect(mongoUri);
  } catch (error) {
    if (error.message.includes("querySrv ECONNREFUSED")) {
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
      await mongoose.connect(mongoUri);
      return;
    }

    throw error;
  }

  console.log("✅ MongoDB connected successfully");
}

connectToMongoDB().catch((error) => {
  console.error("❌ MongoDB connection failed:", error.message);
});

// Home
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is alive"
  });
});

// ADD USER
app.post("/api/users", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const user = new User({
      name: name
    });

    await user.save();

    res.status(201).json({
      message: "User added successfully",
      user: user
    });

  } catch (error) {
    console.error("Add user error:", error);

    res.status(500).json({
      message: "Failed to add user",
      error: error.message
    });
  }
});

// GET ALL USERS
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      count: users.length,
      users: users
    });

  } catch (error) {
    console.error("Get users error:", error); 

    res.status(500).json({
      message: "Failed to get users",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});