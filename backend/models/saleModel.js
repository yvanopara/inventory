import mongoose from "mongoose";

const saleSchema = new mongoose.Schema( 
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantSize: { type: String },
    quantity: { type: Number, required: true },
    productName: { type: String },

    sellingPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    profit: { type: Number, required: true },
    comment: { type: String, trim: true },
    finalPrice: { type: Number },
    revenue: { type: Number },

    customerPhone: { type: String, trim: true },
    proofImage: { type: String },

    // ✅ Champs pour la réservation
    status: {
      type: String,
      enum: ["active", "cancelled", "reserved", "delivered"], // <-- ajout “reserved” et “delivered”
      default: "active"
    },
    isReserved: { type: Boolean, default: false },
    deliveryDate: { type: Date },
    reservedAt: { type: Date },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

const saleModel = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
export default saleModel;
