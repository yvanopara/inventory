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
    const movements = await StockMovement.find()
      .populate("productId", "name image") // ✅ Charge le nom et l’image du produit
      .sort({ date: -1 });

    // On formate la réponse comme dans getDailySummary
    const formattedMovements = movements.map(mov => ({
      productPhoto: mov.productId?.image || "",
      productName: mov.productName || mov.productId?.name || "Produit inconnu",
      variantSize: mov.variantSize || "",
      type: mov.type,
      quantity: mov.quantity,
      note: mov.note || "",
      date: mov.date
    }));

    res.status(200).json(formattedMovements);
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
    const sales = await StockMovement.find({ type: "sale" })
      .populate("productId", "name image")
      .sort({ date: -1 });

    const formattedSales = sales.map(sale => ({
      productPhoto: sale.productId?.image || "",
      productName: sale.productName || sale.productId?.name || "Produit inconnu",
      variantSize: sale.variantSize || "",
      quantity: sale.quantity,
      note: sale.note || "",
      date: sale.date
    }));

    res.status(200).json(formattedSales);
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
    const cancels = await StockMovement.find({ type: "cancelSale" })
      .populate("productId", "name image")
      .sort({ date: -1 });

    const formattedCancels = cancels.map(cancel => ({
      productPhoto: cancel.productId?.image || "",
      productName: cancel.productName || cancel.productId?.name || "Produit inconnu",
      variantSize: cancel.variantSize || "",
      quantity: cancel.quantity,
      note: cancel.note || "",
      date: cancel.date
    }));

    res.status(200).json(formattedCancels);
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
    const additions = await StockMovement.find({ type: "add" })
      .populate("productId", "name image")
      .sort({ date: -1 });

    const formattedAdditions = additions.map(add => ({
      productPhoto: add.productId?.image || "",
      productName: add.productName || add.productId?.name || "Produit inconnu",
      variantSize: add.variantSize || "",
      quantity: add.quantity,
      note: add.note || "",
      date: add.date
    }));

    res.status(200).json(formattedAdditions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
