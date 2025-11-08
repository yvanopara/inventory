import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import StockMovement from "../models/stockMovementModel.js";

// Config Cloudinary
cloudinary.config({
  cloud_name: "TON_CLOUD_NAME",
  api_key: "TON_API_KEY",
  api_secret: "TON_API_SECRET",
});

// --- Fonction d'alerte stock faible --- 
// --- Fonction utilitaire pour détecter les stocks faibles ---
export const checkLowStock = (product) => {
  const alerts = [];
  const threshold = product.minStock || 5; // seuil d’alerte dynamique

  // Cas 1️⃣ : produit simple (sans variantes)
  if (!product.hasVariants || !product.sizes || product.sizes.length === 0) {
    if (product.stock <= threshold) {
      alerts.push({
        productName: product.name,
        quantity: product.stock, // 🔥 ici on renvoie bien le stock actuel
      });
    }
  }

  // Cas 2️⃣ : produit avec variantes
  else {
    product.sizes.forEach((variant) => {
      if (variant.stock <= threshold) {
        alerts.push({
          productName: `${product.name} - ${variant.size}`,
          quantity: variant.stock,
        });
      }
    });
  }

  return alerts;
};


// --- Fonction pour récupérer toutes les alertes de stock faible ---
export const getLowStockAlerts = async (req, res) => {
  try {
    // 1️⃣ Récupérer tous les produits
    const products = await Product.find();

    // 2️⃣ Tableau pour stocker les alertes
    const alerts = [];

    // 3️⃣ Parcourir chaque produit
    for (const product of products) {
      const productAlerts = checkLowStock(product);

      if (Array.isArray(productAlerts)) {
        productAlerts.forEach((a) => {
          alerts.push({
            productName: a.productName || product.name || "Produit inconnu",
            quantity: a.quantity || product.quantity || 0,
            image: product.image || null // ← on ajoute l'image ici
          });
        });
      }
    }

    // 4️⃣ Retourner les alertes
    res.status(200).json({
      message: "Alertes de stock faible récupérées avec succès",
      alerts,
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des alertes de stock faible",
      error: error.message,
    });
  }
};



// --- Historique des mouvements de stock ---
export const getStockHistory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });

    const history = {
      productId: product._id,
      name: product.name,
      totalStock: product.totalStock,
      totalSold: product.totalSold,
      stockByVariant: product.hasVariants ? product.sizes.map(v => ({
        size: v.size,
        stock: v.stock,
        totalSold: v.totalSold
      })) : null
    };

    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'historique", error: error.message });
  }
};

// --- Ajouter un produit ---
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      costPrice,
      sellingPrice,
      discount,
      stock,
      minStock,          // ← ajouté pour le produit simple
      hasVariants,
      sizes
    } = req.body;

    let parsedSizes = [];
    if (hasVariants === "true" && sizes) {
      try {
        parsedSizes = JSON.parse(sizes);

        // Assurer que chaque variante a un minStock (par défaut 0 si absent)
        parsedSizes = parsedSizes.map(v => ({
          ...v,
          minStock: v.minStock !== undefined ? Number(v.minStock) : 0,
          stock: Number(v.stock),
          costPrice: Number(v.costPrice),
          sellingPrice: Number(v.sellingPrice),
          discount: Number(v.discount) || 0
        }));
      } catch (e) {
        return res.status(400).json({ message: "Erreur de format pour sizes", error: e.message });
      }
    }

    const productData = {
      name,
      sku: sku || null,
      category,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      discount: Number(discount) || 0,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0, // ← ajouté pour le produit simple
      hasVariants: hasVariants === "true",
      sizes: parsedSizes
    };

    // Upload image sur Cloudinary si fichier présent
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });
      productData.image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const product = new Product(productData);
    await product.save();

    // Création d'un mouvement de stock
    await StockMovement.create({
      productId: product._id,
      productName: product.name,
      type: "add",
      quantity: product.stock || 0,
      note: "Produit ajouté au stock"
    });

    const alerts = checkLowStock(product);

    res.status(201).json({ message: "Produit ajouté avec succès", product, alerts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erreur lors de l'ajout du produit", error: error.message });
  }
};


// --- Récupérer tous les produits ---
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la récupération des produits", error: error.message });
  }
};

// --- Récupérer un produit par ID ---
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la récupération du produit", error: error.message });
  }
};

// --- Mettre à jour un produit ---
export const updateProduct = async (req, res) => {
  try {
    const updatedData = req.body;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });
      updatedData.image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Produit non trouvé" });

    const alerts = checkLowStock(updatedProduct);

    res.status(200).json({ message: "Produit mis à jour", product: updatedProduct, alerts });
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la mise à jour du produit", error: error.message });
  }
};

// --- Supprimer un produit ---
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Produit non trouvé" });
    res.status(200).json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la suppression du produit", error: error.message });
  }
};

// --- Modifier stock ---
export const modifyStock = async (req, res) => {
  try {
    const { productId } = req.params;
    let { quantity, variantSize } = req.body;

    quantity = Number(quantity);
    if (isNaN(quantity))
      return res.status(400).json({ message: "La quantité doit être un nombre" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    let note = "";
    if (product.hasVariants && variantSize) {
      const variant = product.sizes.find(v => v.size === variantSize);
      if (!variant) return res.status(404).json({ message: "Variante introuvable" });

      variant.stock += quantity;
      note = quantity > 0 ? "Stock ajouté" : "Stock retiré";
    } else {
      product.stock += quantity;
      note = quantity > 0 ? "Stock ajouté" : "Stock retiré";
    }

    await product.save();

    await StockMovement.create({
      productId: product._id,
      productName: product.name,
      variantSize: variantSize || null,
      type: quantity > 0 ? "add" : "remove",
      quantity: Math.abs(quantity),
      totalStock: product.totalStock,
      note
    });

    res.status(200).json({ message: "Stock modifié avec succès", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// --- Modifier prix ---
export const modifyPrice = async (req, res) => {
  try {
    const { productId } = req.params;
    const { price, variantSize } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    if (product.hasVariants && variantSize) {
      const variant = product.sizes.find(v => v.size === variantSize);
      if (!variant) return res.status(404).json({ message: "Variante introuvable" });
      variant.sellingPrice = Number(price);
    } else {
      product.sellingPrice = Number(price);
    }

    await product.save();
    res.status(200).json({ message: "Prix modifié avec succès", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
