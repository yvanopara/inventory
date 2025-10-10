// stockMovementController.js
import StockMovement from "../models/stockMovementModel.js";
import productModel from "../models/productModel.js";

// ---------------------------
// Créer un mouvement de stock
// ---------------------------
export const createStockMovement = async ({ productId, productName, variantSize, type, quantity, note }) => {
  return await StockMovement.create({
    productId,
    productName: productName || null,
    variantSize: variantSize || null,
    type,
    quantity,
    note
  });
};

// ----------------------------------
// Récupérer tous les mouvements
// ----------------------------------
export const getAllStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find().sort({ createdAt: -1 });
    res.status(200).json(movements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ----------------------------------
// Récupérer seulement les ventes
// ----------------------------------
export const getSalesMovements = async (req, res) => {
  try {
    const sales = await StockMovement.find({ type: "sale" }).sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ----------------------------------
// Récupérer seulement les annulations
// ----------------------------------
export const getCancelMovements = async (req, res) => {
  try {
    const cancels = await StockMovement.find({ type: "cancelSale" }).sort({ createdAt: -1 });
    res.status(200).json(cancels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ----------------------------------
// Récupérer seulement les ajouts
// ----------------------------------
export const getAdditionMovements = async (req, res) => {
  try {
    const additions = await StockMovement.find({ type: "add" }).sort({ date: -1 });
    res.status(200).json(additions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

