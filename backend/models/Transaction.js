const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "upi", "other"],
      default: "cash",
    },
    notes: { type: String, trim: true, default: "" },
    source: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

transactionSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
