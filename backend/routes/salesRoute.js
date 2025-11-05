import express from "express";
import { 
  addSale, 
  cancelSale, 
  deliverSale, 

  getAllSales, 
 
  getDailySummary, 
  getMonthlySummary, 
  getReservedSales, 
  getWeeklySummary,   // ✅ on importe la nouvelle fonction
  reserveSale
} from "../controllers/salesController.js";
import upload from "../middleweres/multer.js";
import userAuth from "../middleweres/userAuth.js";

const router = express.Router();

// ➝ Ajouter une vente avec une image (optionnelle)
router.post("/",userAuth, upload.single("proofImage"), addSale);

// ➝ Résumé des ventes du jour 
router.get("/summary/daily", getDailySummary);

// ➝ Résumé des ventes de la semaine
router.get("/summary/weekly", getWeeklySummary);

router.get("/summary/monthly", getMonthlySummary);

router.patch("/cancel/:saleId", cancelSale);

// ➝ Réserver une commande
router.post("/reserve", userAuth, reserveSale);

// ➝ Livrer une commande réservée
router.patch("/deliver/:saleId",userAuth, deliverSale); 

 router.get("/get-all", getAllSales); 
 router.get("/get-reserve", getReservedSales); 

export default router;
