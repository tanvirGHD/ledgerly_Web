const express = require("express");
const requireAuth = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const Salary = require("../models/Salary");

const router = express.Router();
router.use(requireAuth);

// GET /api/reports/dashboard -> KPIs, 6-month trend, this-month category breakdown, recent transactions
router.get("/dashboard", async (req, res, next) => {
  try {
    const owner = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const allTx = await Transaction.find({ owner });

    const allTimeBalance = allTx.reduce(
      (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
      0
    );

    const monthTx = allTx.filter((t) => t.date >= startOfMonth && t.date <= endOfMonth);
    const monthIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const monthExpense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    const activeSalary = await Salary.findOne({
      owner,
      effectiveFrom: { $lte: now },
      $or: [{ effectiveTo: null }, { effectiveTo: { $gte: now } }],
    }).sort({ effectiveFrom: -1 });

    // 6-month income vs expense trend
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const bucket = allTx.filter((t) => t.date >= start && t.date <= end);
      trend.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        income: bucket.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: bucket.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }

    // Category breakdown for the current month (expenses only)
    const byCategory = {};
    monthTx
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      });
    const categoryBreakdown = Object.entries(byCategory).map(([category, value]) => ({ category, value }));

    const recent = [...allTx]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    res.json({
      kpis: {
        balance: allTimeBalance,
        monthIncome,
        monthExpense,
        monthRemaining: monthIncome - monthExpense,
        monthlySalary: activeSalary ? activeSalary.net : 0,
      },
      trend,
      categoryBreakdown,
      recentTransactions: recent,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/range?range=7d|4w|6m|year
router.get("/range", async (req, res, next) => {
  try {
    const owner = req.userId;
    const range = req.query.range || "7d";
    const now = new Date();
    let start;

    if (range === "7d") start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    else if (range === "4w") start = new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000);
    else if (range === "6m") start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    else start = new Date(now.getFullYear(), 0, 1); // year

    const tx = await Transaction.find({ owner, date: { $gte: start, $lte: now } }).sort({ date: 1 });

    const byDay = {};
    tx.forEach((t) => {
      const key = t.date.toISOString().slice(0, 10);
      if (!byDay[key]) byDay[key] = { date: key, income: 0, expense: 0 };
      byDay[key][t.type] += t.amount;
    });

    const byCategory = {};
    tx.filter((t) => t.type === "expense").forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    res.json({
      series: Object.values(byDay),
      categoryBreakdown: Object.entries(byCategory).map(([category, value]) => ({ category, value })),
      transactions: tx,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
