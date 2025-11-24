import express from "express";
import { 
  addSale, 
  cancelSale, 
  deliverSale, 

  getAllSales, 
 
  gettDailySummary, 
  gettMonthlySummary, 
  getReservedSales, 
  getSalesSummaryDashboard, 
  getTopAndLowSellingProducts, 
  gettWeeklySummary,   getYearlySummary,   // ✅ on importe la nouvelle fonction
  reserveSale
} from "../controllers/salesController.js";
import upload from "../middleweres/multer.js";
import userAuth from "../middleweres/userAuth.js";

const router = express.Router();

// ➝ Ajouter une vente avec une image (optionnelle)
router.post("/",userAuth, upload.single("proofImage"), addSale);

// ➝ Résumé des ventes du jour 
router.get("/summary/daily", gettDailySummary);

// ➝ Résumé des ventes de la semaine
router.get("/summary/weekly", gettWeeklySummary);

router.get("/summary/monthly", gettMonthlySummary); 

router.get("/yearly-summary", getYearlySummary);
router.get("/dashboard-summary", getSalesSummaryDashboard);


router.patch("/cancel/:saleId", cancelSale);

// ➝ Réserver une commande
router.post("/reserve", userAuth, reserveSale);

// ➝ Livrer une commande réservée 
router.patch("/deliver/:saleId",userAuth, deliverSale); 

 router.get("/get-all", getAllSales); 
 router.get("/get-reserve", getReservedSales); 
 router.get("/top-and-low-products", getTopAndLowSellingProducts);

export default router;
