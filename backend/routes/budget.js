const express = require("express");
const requireAuth = require("../middleware/auth");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const router = express.Router();
router.use(requireAuth);

// GET /api/budgets?month=YYYY-MM  -> budgets plus computed "spent" for that month
router.get("/", async (req, res, next) => {
  try {
    const month = req.query.month || currentMonthKey();
    const budgets = await Budget.find({ owner: req.userId, month });

    const [start, end] = monthRange(month);
    const expenses = await Transaction.find({
      owner: req.userId,
      type: "expense",
      date: { $gte: start, $lte: end },
    });

    const spentByCategory = {};
    let totalSpent = 0;
    for (const tx of expenses) {
      spentByCategory[tx.category] = (spentByCategory[tx.category] || 0) + tx.amount;
      totalSpent += tx.amount;
    }

    const withSpent = budgets.map((b) => ({
      ...b.toObject(),
      spent: b.category ? spentByCategory[b.category] || 0 : totalSpent,
    }));

    res.json({ budgets: withSpent });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { month, category, limit } = req.body;
    if (!month || limit == null) return res.status(400).json({ message: "month and limit are required" });

    const budget = await Budget.findOneAndUpdate(
      { owner: req.userId, month, category: category || null },
      { limit },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ budget });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthRange(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return [start, end];
}

module.exports = router;
