const express = require("express");
const requireAuth = require("../middleware/auth");
const Category = require("../models/Category");

const router = express.Router();

// List default + this user's own categories
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [{ isDefault: true }, { owner: req.userId }],
    }).sort({ isDefault: -1, name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ message: "Name and type are required" });
    const category = await Category.create({ name, type, owner: req.userId, isDefault: false });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
