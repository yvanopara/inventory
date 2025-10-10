import productModel from "../models/productModel.js";
import saleModel from "../models/saleModel.js";
import StockMovement from "../models/stockMovementModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { checkLowStock } from "./productController.js";

// --- Ajouter une vente ---
export const addSale = async (req, res) => {
  try {
    const { productId, variantSize, quantity, discount = 0, customerPhone, comment } = req.body;

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    let unitPrice, costPrice;

    if (product.hasVariants) {
      const variant = product.sizes.find(v => v.size === variantSize);
      if (!variant) return res.status(404).json({ message: "Variante introuvable" });
      if (variant.stock < quantity) return res.status(400).json({ message: "Stock insuffisant" });

      unitPrice = variant.sellingPrice;
      costPrice = variant.costPrice;

      variant.stock -= quantity;
      variant.totalSold += quantity;
      variant.lastSoldAt = new Date();
    } else {
      if (product.stock < quantity) return res.status(400).json({ message: "Stock insuffisant" });

      unitPrice = product.sellingPrice;
      costPrice = product.costPrice;

      product.stock -= quantity;
      product.totalSold += quantity;
      product.lastSoldAt = new Date();
    }

    const finalPrice = (unitPrice - discount) * quantity;
    const profit = (unitPrice - costPrice - discount) * quantity;
    const totalCost = costPrice * quantity;

    await product.save();

    // Upload preuve si présente
    let proofImageUrl = null;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "sales_proofs",
        resource_type: "image",
      });
      proofImageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const sale = new saleModel({
      productId: product._id,
      variantSize: variantSize || null,
      quantity,
      sellingPrice: unitPrice,
      productName: product.name,
      discount,
      finalPrice,
      profit,
      costPrice,
      totalCost,
      comment: comment || null,
      customerPhone: customerPhone || null,
      proofImage: proofImageUrl
    });

    await sale.save();

    // Historique stock
    await StockMovement.create({
      productId: product._id,
      productName: product.name,
      variantSize: variantSize || null,
      type: "sale",
      quantity,
      note: "Vente enregistrée"
    });

    const alerts = checkLowStock(product);

    res.status(201).json({ message: "Vente enregistrée", sale, alerts });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// --- Annuler une vente ---
export const cancelSale = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await saleModel.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Vente introuvable" });
    if (sale.status === "cancelled") return res.status(400).json({ message: "Vente déjà annulée" });

    const product = await productModel.findById(sale.productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    // Remettre le stock à jour
    if (product.hasVariants && sale.variantSize) {
      const variant = product.sizes.find(v => v.size === sale.variantSize);
      if (variant) {
        variant.stock += sale.quantity;
        variant.totalSold -= sale.quantity;
      }
    } else {
      product.stock += sale.quantity;
      product.totalSold -= sale.quantity;
    }

    await product.save();

    // Historique stock
    await StockMovement.create({
      productId: product._id,
      variantSize: sale.variantSize || null,
      type: "cancelSale",
      quantity: sale.quantity,
      note: "Vente annulée"
    });

    // Mettre les valeurs de la vente à zéro et marquer annulée
    sale.finalPrice = 0;
    sale.profit = 0;
    sale.totalCost = 0;
    sale.status = "cancelled";
    sale.cancelledAt = new Date();
    await sale.save();

    const alerts = checkLowStock(product);

    res.status(200).json({ message: "Vente annulée avec succès", sale, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// --- Résumés quotidiens, hebdomadaires et mensuels ---
const computeSummary = (sales) => {
  let totalQuantity = 0, totalRevenue = 0, totalProfit = 0, totalCost = 0;
  sales.forEach(sale => {
    totalQuantity += sale.quantity;
    totalRevenue += sale.finalPrice;
    totalProfit += sale.profit;
    totalCost += sale.totalCost;
  });
  return { totalQuantity, totalRevenue, totalProfit, totalCost };
};

export const getDailySummary = async (req, res) => {
  try {
    const start = new Date(); 
    start.setHours(0, 0, 0, 0);
    const end = new Date(); 
    end.setHours(23, 59, 59, 999);

    const sales = await saleModel
      .find({ date: { $gte: start, $lte: end }, status: "active" })
      .populate("productId", "name image") // ✅ image du produit
      .sort({ date: -1 });

    const dailySales = sales.map((sale) => ({
      productPhoto: sale.productId?.image || "", // image produit
      productName: sale.productName || sale.productId?.name,
      quantity: sale.quantity,
      comment: sale.comment || "",
      proofImage: sale.proofImage || "",
      customerPhone: sale.customerPhone || "",
      date: sale.date,
      discount: sale.discount || 0,
      revenue: sale.finalPrice || 0,
      profit: sale.profit || 0,
      cost: sale.totalCost || 0,
    }));

    const summary = {
      totalQuantity: dailySales.reduce((sum, s) => sum + s.quantity, 0),
      totalRevenue: dailySales.reduce((sum, s) => sum + s.revenue, 0),
      totalProfit: dailySales.reduce((sum, s) => sum + s.profit, 0),
      totalCost: dailySales.reduce((sum, s) => sum + s.cost, 0),
    };

    res.status(200).json({
      date: new Date().toLocaleDateString("fr-FR"),
      sales: dailySales,
      summary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


export const getWeeklySummary = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1); // Lundi
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Dimanche
    end.setHours(23, 59, 59, 999);

    const sales = await saleModel
      .find({ date: { $gte: start, $lte: end }, status: "active" })
      .populate("productId", "name image")
      .sort({ date: 1 });

    // Grouper les ventes par jour
    const dailySalesMap = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dailySalesMap[day.toDateString()] = [];
    }

    sales.forEach((sale) => {
      const day = new Date(sale.date).toDateString();
      dailySalesMap[day].push({
        productPhoto: sale.productId?.image || null,
        productName: sale.productName || sale.productId?.name || "Produit inconnu",
        quantity: sale.quantity,
        comment: sale.comment,
        proofImage: sale.proofImage || null,
        customerPhone: sale.customerPhone,
        date: sale.date,
        discount: sale.discount,
        revenue: sale.finalPrice || 0,
        profit: sale.profit || 0,
        cost: sale.totalCost || 0,
      });
    });

    // Résumé global
    const summary = {
      totalQuantity: sales.reduce((sum, s) => sum + s.quantity, 0),
      totalRevenue: sales.reduce((sum, s) => sum + (s.finalPrice || 0), 0),
      totalProfit: sales.reduce((sum, s) => sum + (s.profit || 0), 0),
      totalCost: sales.reduce((sum, s) => sum + (s.totalCost || 0), 0),
    };

    res.status(200).json({
      startDate: start,
      endDate: end,
      dailySales: dailySalesMap,
      summary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};



// controllers/saleController.js

export const getMonthlySummary = async (req, res) => {
  try {
    // Définir le début et la fin du mois courant
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    // Récupérer toutes les ventes actives du mois
    const sales = await saleModel.find({
      date: { $gte: start, $lte: end },
      status: "active",
    });

    if (!sales.length) {
      return res.status(200).json({
        message: "Aucune vente enregistrée pour ce mois.",
        month: now.toLocaleString("fr-FR", { month: "long" }),
        year: now.getFullYear(),
        weeklySummaries: [],
        totalSummary: { totalSales: 0, totalItems: 0, averagePerSale: 0 },
      });
    }

    // === Étape 1 : regrouper les ventes par jour ===
    const salesByDay = {};
    sales.forEach((sale) => {
      const dayKey = new Date(sale.date).toISOString().split("T")[0]; // ex: "2025-10-06"
      if (!salesByDay[dayKey]) salesByDay[dayKey] = [];
      salesByDay[dayKey].push(sale);
    });

    // === Étape 2 : regrouper les jours par semaine ===
    const weeks = [];
    let currentWeek = [];
    let currentWeekStart = null;

    const sortedDays = Object.keys(salesByDay).sort();

    sortedDays.forEach((day, index) => {
      const dateObj = new Date(day);
      const dayOfWeek = dateObj.getDay(); // 0 = dimanche, 1 = lundi...
      if (currentWeekStart === null) currentWeekStart = day;

      currentWeek.push({ date: day, sales: salesByDay[day] });

      // Si fin de semaine (dimanche ou dernier jour du mois)
      const isLastDay = index === sortedDays.length - 1;
      if (dayOfWeek === 0 || isLastDay) {
        weeks.push({
          startDate: currentWeekStart,
          endDate: day,
          days: currentWeek.map((d) => ({
            date: d.date,
            sales: d.sales,
            summary: computeSummary(d.sales),
          })),
          weekSummary: computeSummary(currentWeek.flatMap((d) => d.sales)),
        });
        currentWeek = [];
        currentWeekStart = null;
      }
    });

    // === Étape 3 : total du mois ===
    const totalSummary = computeSummary(sales);

    // === Étape 4 : réponse finale ===
    res.status(200).json({
      month: now.toLocaleString("fr-FR", { month: "long" }),
      year: now.getFullYear(),
      weeklySummaries: weeks,
      totalSummary,
    });
  } catch (err) {
    console.error("Erreur dans getMonthlySummary :", err);
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message,
    });
  }
};


// --- Réserver une commande ---
export const reserveSale = async (req, res) => {
  try {
    const { productId, variantSize, quantity, discount = 0, customerPhone, comment, deliveryDate } = req.body;

    // Vérification de la date de livraison
    if (!deliveryDate) {
      return res.status(400).json({ message: "La date de livraison est obligatoire" });
    }
    const delivery = new Date(deliveryDate);
    const today = new Date();
    if (delivery <= today) {
      return res.status(400).json({ message: "La date de livraison doit être postérieure à aujourd'hui" });
    }

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    let unitPrice, costPrice;

    if (product.hasVariants) {
      const variant = product.sizes.find(v => v.size === variantSize);
      if (!variant) return res.status(404).json({ message: "Variante introuvable" });
      if (variant.stock < quantity) return res.status(400).json({ message: "Stock insuffisant" });

      unitPrice = variant.sellingPrice;
      costPrice = variant.costPrice;

      // ❌ On ne déduit pas encore le stock tant que ce n’est pas livré
    } else {
      if (product.stock < quantity) return res.status(400).json({ message: "Stock insuffisant" });

      unitPrice = product.sellingPrice;
      costPrice = product.costPrice;
    }

    const finalPrice = (unitPrice - discount) * quantity;
    const profit = (unitPrice - costPrice - discount) * quantity;
    const totalCost = costPrice * quantity;

    const sale = new saleModel({
      productId: product._id,
      variantSize: variantSize || null,
      quantity,
      sellingPrice: unitPrice,
      costPrice,
      productName: product.name,
      discount,
      finalPrice,
      profit,
      totalCost,
      comment: comment || null,
      customerPhone: customerPhone || null,
      status: "reserved",
      isReserved: true,
      deliveryDate: delivery,
      reservedAt: new Date()
    });

    await sale.save();

    res.status(201).json({ message: "Commande réservée avec succès", sale });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// --- Marquer une commande réservée comme livrée ---
export const deliverSale = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await saleModel.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Commande introuvable" });
    if (sale.status !== "reserved") return res.status(400).json({ message: "Cette commande n'est pas en attente de livraison" });

    const product = await productModel.findById(sale.productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    if (product.hasVariants && sale.variantSize) {
      const variant = product.sizes.find(v => v.size === sale.variantSize);
      if (!variant || variant.stock < sale.quantity) {
        return res.status(400).json({ message: "Stock insuffisant pour livrer" });
      }
      variant.stock -= sale.quantity;
      variant.totalSold += sale.quantity;
    } else {
      if (product.stock < sale.quantity) {
        return res.status(400).json({ message: "Stock insuffisant pour livrer" });
      }
      product.stock -= sale.quantity;
      product.totalSold += sale.quantity;
    }

    await product.save();

    sale.status = "delivered";
    sale.lastUpdated = new Date();
    await sale.save();

    await StockMovement.create({
      productId: product._id,
      productName: product.name,
      variantSize: sale.variantSize || null,
      type: "delivery",
      quantity: sale.quantity,
      note: "Commande livrée"
    });

    res.status(200).json({ message: "Commande livrée avec succès", sale });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


