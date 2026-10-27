const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Category = require("../models/Category");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const DEFAULT_CATEGORIES = [
  { name: "Food", type: "expense" },
  { name: "Rent", type: "expense" },
  { name: "Shopping", type: "expense" },
  { name: "Bills", type: "expense" },
  { name: "Medical", type: "expense" },
  { name: "Transport", type: "expense" },
  { name: "Entertainment", type: "expense" },
  { name: "Others", type: "expense" },
  { name: "Salary", type: "income" },
  { name: "Freelance", type: "income" },
  { name: "Other Income", type: "income" },
];

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

router.get("/google", (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth?oauth=unavailable`);
  }
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.API_URL || "http://localhost:5000"}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/google/callback", async (req, res, next) => {
  try {
    const redirectBase = process.env.CLIENT_URL || "http://localhost:5173";
    if (!req.query.code) return res.redirect(`${redirectBase}/auth?oauth=failed`);
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.API_URL || "http://localhost:5000"}/api/auth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code: req.query.code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    const tokens = await tokenResponse.json();
    if (!tokens.access_token) return res.redirect(`${redirectBase}/auth?oauth=failed`);
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = await profileResponse.json();
    if (!profile.email) return res.redirect(`${redirectBase}/auth?oauth=failed`);
    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await User.create({ displayName: profile.name || profile.email.split("@")[0], email: profile.email.toLowerCase(), passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10) });
      await ensureDefaultCategories();
    }
    res.redirect(`${redirectBase}/auth?token=${signToken(user)}`);
  } catch (err) {
    next(err);
  }
});

function toPublicUser(user) {
  return {
    id: user._id,
    displayName: user.displayName,
    email: user.email,
    currency: user.currency,
    role: user.role,
  };
}

// Ensure the shared default categories exist (idempotent, runs once lazily)
async function ensureDefaultCategories() {
  const count = await Category.countDocuments({ isDefault: true });
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true })));
  }
}

router.post("/signup", async (req, res, next) => {
  try {
    const { displayName, email, password, currency } = req.body;
    if (!displayName || !email || !password) {
      return res.status(400).json({ message: "Display name, email and password are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      displayName,
      email: email.toLowerCase(),
      passwordHash,
      currency: currency || "BDT",
    });

    await ensureDefaultCategories();

    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const user = await User.findOne({ email });
    const response = { message: "If an account exists, reset instructions are ready." };

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
      await user.save();
      response.resetToken = resetToken;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "A valid reset token and password of at least 6 characters are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "This reset link is invalid or expired" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: "Password reset" });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const { displayName, currency } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(displayName && { displayName }), ...(currency && { currency }) },
      { new: true }
    );
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
