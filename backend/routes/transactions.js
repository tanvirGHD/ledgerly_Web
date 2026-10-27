const express = require("express");
const requireAuth = require("../middleware/auth");
const Transaction = require("../models/Transaction");

const router = express.Router();
router.use(requireAuth);

// GET /api/transactions?type=&category=&from=&to=&search=
router.get("/", async (req, res, next) => {
  try {
    const { type, category, from, to, search } = req.query;
    const filter = { owner: req.userId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ notes: re }, { source: re }, { category: re }];
    }

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { type, amount, category, date, paymentMethod, notes, source } = req.body;
    if (!type || !amount || !category || !date) {
      return res.status(400).json({ message: "type, amount, category and date are required" });
    }
    const transaction = await Transaction.create({
      owner: req.userId,
      type,
      amount,
      category,
      date,
      paymentMethod: paymentMethod || "cash",
      notes,
      source,
    });
    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json({ transaction });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
