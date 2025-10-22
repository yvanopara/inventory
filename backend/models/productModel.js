import mongoose from "mongoose";

// --- Variante (taille) ---
const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true }, 
    sku: { type: String,  trim: true },

    // Prix
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },

    // Stock
    stock: { type: Number, required: true, min: 0 },
    minStock: { type: Number, default: 0, min: 0 }, // seuil alerte

    // Suivi des ventes par variante
    totalSold: { type: Number, default: 0 },  
    lastSoldAt: { type: Date }
  },
  { _id: false }
);

// --- Produit ---
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    image: { type: String, default: "" },
    category: { type: String, required: true, trim: true },

    hasVariants: { type: Boolean, default: false },

    // PRODUIT SIMPLE
    costPrice: { type: Number, min: 0, required: function () { return !this.hasVariants; } },
    sellingPrice: { type: Number, min: 0, required: function () { return !this.hasVariants; } },
    discount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, min: 0, required: function () { return !this.hasVariants; } },
    minStock: { type: Number, min: 0, default: 0 }, // seuil alerte

    // VARIANTES
    sizes: { type: [variantSchema], default: [] },

    // Suivi global des ventes
    totalSold: { type: Number, default: 0 },   
    lastSoldAt: { type: Date },                 

    // Statistiques stock
    totalStock: { type: Number, default: 0 },  
    reorderLevel: { type: Number, default: 0 },
    stockStatus: { type: String, enum: ["ok", "low", "outOfStock"], default: "ok" },

    status: { type: String, enum: ["active", "inactive", "archived"], default: "active" }
  },
  { timestamps: true }
);

// --- Middleware pour auto-calculer le stock total et status ---
productSchema.pre("save", function (next) {
  if (this.hasVariants) {
    this.totalStock = this.sizes.reduce((acc, v) => acc + v.stock, 0);
    this.stockStatus = this.totalStock <= this.reorderLevel ? "low" : "ok";
  } else {
    this.totalStock = this.stock;
    this.stockStatus = this.stock <= this.minStock ? "low" : "ok";
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
