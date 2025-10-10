import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantSize: { type: String }, // optionnel (null si produit simple)

    date: { type: Date, default: Date.now },
    quantity: { type: Number, required: true }, // ✅ unique définition

    productName: { type: String }, // ajoutémvx

    sellingPrice: { type: Number, required: true }, // prix de vente unitaire
    discount: { type: Number, default: 0 },
    totalCost: { type: Number, required: true }, // coût cumulé pour cette vente
    costPrice: { type: Number, required: true }, // prix de revient du produit ou variante
    profit: { type: Number, required: true }, // (sellingPrice - costPrice - discount) * quantity
    comment: { type: String, trim: true }, // optionnel
    finalPrice: { type: Number }, // (sellingPrice - discount) * quantity
    revenue: { type: Number }, // montant total encaissé

    customerPhone: { type: String, trim: true }, // numéro du client

    proofImage: { type: String }, // URL de l'image (Cloudinary ou dossier local)

    status: { type: String, enum: ["active", "cancelled"], default: "active" },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
export default Sale;
