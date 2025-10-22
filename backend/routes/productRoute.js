import express from "express";
import multer from "multer";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockAlerts,
  getStockHistory,
  modifyStock,
  modifyPrice
} from "../controllers/productController.js";
import adminAuth from "../middleweres/adminAuth.js";

const productRouter = express.Router();

// --- Config Multer pour upload local temporaire ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // dossier temporaire
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// --- Routes CRUD ---

productRouter.post("/", adminAuth, upload.single("image"), addProduct);        // Ajouter un produit avec image
productRouter.get("/", getAllProducts);                             // Récupérer tous les produits

productRouter.put("/:id", upload.single("image"), updateProduct);   // Mettre à jour un produit avec image
productRouter.delete("/:id",adminAuth, deleteProduct);                        // Supprimer un produit
productRouter.patch("/modify/stock/:productId", modifyStock);
productRouter.patch("/modify/price/:productId", modifyPrice);

// --- Routes supplémentaires ---

// Alertes stock faible (produits ou variantes)
productRouter.get("/alerts/low-stock", getLowStockAlerts);

// Historique des mouvements de stock
productRouter.get("/stock-history/:productId", getStockHistory);  
productRouter.get("/:id", getProductById);                          // Récupérer un produit par ID
export default productRouter;
