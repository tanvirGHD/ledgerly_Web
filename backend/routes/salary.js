const express = require("express");
const requireAuth = require("../middleware/auth");
const Salary = require("../models/Salary");
const Transaction = require("../models/Transaction");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const salaries = await Salary.find({ owner: req.userId }).sort({ effectiveFrom: -1 });
    res.json({ salaries });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { source, gross, bonus, deductions, net, effectiveFrom, effectiveTo, notes } = req.body;
    if (!source || gross == null || net == null || !effectiveFrom) {
      return res.status(400).json({ message: "source, gross, net and effectiveFrom are required" });
    }
    const salary = await Salary.create({
      owner: req.userId,
      source,
      gross,
      bonus: bonus || 0,
      deductions: deductions || 0,
      net,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      notes,
    });
    res.status(201).json({ salary });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const salary = await Salary.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, req.body, {
      new: true,
    });
    if (!salary) return res.status(404).json({ message: "Salary not found" });
    res.json({ salary });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const salary = await Salary.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!salary) return res.status(404).json({ message: "Salary not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

// Post this salary's net amount as an income transaction for the current month
// (skips if already posted for that month, mirroring the original app's behaviour)
router.post("/:id/post-to-month", async (req, res, next) => {
  try {
    const salary = await Salary.findOne({ _id: req.params.id, owner: req.userId });
    if (!salary) return res.status(404).json({ message: "Salary not found" });

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    if (salary.postedMonths.includes(monthKey)) {
      return res.status(409).json({ message: "This salary has already been posted for this month" });
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transaction = await Transaction.create({
      owner: req.userId,
      type: "income",
      amount: salary.net,
      category: "Salary",
      date: startOfMonth,
      paymentMethod: "bank_transfer",
      source: salary.source,
      notes: `Monthly salary for ${monthKey}`,
    });

    salary.postedMonths.push(monthKey);
    await salary.save();

    res.status(201).json({ transaction, salary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
