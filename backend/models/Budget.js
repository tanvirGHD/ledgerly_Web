const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: String, required: true },
    category: { type: String, default: null },
    limit: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

budgetSchema.index({ owner: 1, month: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
