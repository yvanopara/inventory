import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantSize: { type: String }, // optionnel
  type: { type: String, enum: ["add", "sale", "cancelSale","delivery"], required: true },
  quantity: { type: Number, required: true },
  productName: { type: String },
  date: { type: Date, default: Date.now },
   totalStock: { type: Number }, // <-- ajouté
  note: { type: String }
});

const StockMovement = mongoose.models.StockMovement || mongoose.model("StockMovement", stockMovementSchema);
export default StockMovement; 
