// stockMovementRoutes.js
import express from "express";
import { getAllStockMovements, getSalesMovements, getCancelMovements, getAdditionMovements} from "../controllers/stockMovementController.js";

const stockMovementRoutes = express.Router();

stockMovementRoutes.get("/", getAllStockMovements);          // Tous les mouvements
stockMovementRoutes.get("/sales", getSalesMovements);           // Seulement ventes
stockMovementRoutes.get("/cancels", getCancelMovements);        // Seulement annulations
stockMovementRoutes.get("/additions", getAdditionMovements);    // Seulement ajouts

export default stockMovementRoutes;
