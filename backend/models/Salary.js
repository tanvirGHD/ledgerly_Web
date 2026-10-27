const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: { type: String, required: true, trim: true },
    gross: { type: Number, required: true, min: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net: { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
    postedMonths: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);
