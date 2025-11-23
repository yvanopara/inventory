import express from "express";
import { getDailySummary, getWeeklySummary, getMonthlySummary, getAnnualSummary } from "./controllers/salesController.js";
import TelegramBot from "node-telegram-bot-api";

const router = express.Router();
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

const formatMoney = (v) => Number(v || 0).toLocaleString("fr-FR") + " FCFA";

const buildSummaryMessage = (title, s) => `
📊 *${title}*

📦 *Quantité totale vendue* : ${s.totalQuantity}
💰 *Chiffre d’affaires* : ${formatMoney(s.totalRevenue)}
💸 *Coût total* : ${formatMoney(s.totalCost)}
📈 *Profit total* : ${formatMoney(s.totalProfit)}
`;

// Endpoint test Daily Summary
router.get("/test/daily", async (req, res) => {
  try {
    const { summary } = await getDailySummary(null, null, true);
    const msg = buildSummaryMessage("Résumé Quotidien", summary);
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg, { parse_mode: "Markdown" });
    res.json({ status: "ok", summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
