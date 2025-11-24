import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import { getDailySummary, getWeeklySummary, getMonthlySummaryForCron, getYearlySummary } from "./salesController.js";
import saleModel from "../models/saleModel.js";
// Initialisation du bot Telegram
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

// Formatter l’argent
const formatMoney = (v) => Number(v || 0).toLocaleString("fr-FR") + " FCFA";

// Convertir un summary en message Telegram
const buildSummaryMessage = (title, s) => `
📊 *${title}*

📦 *Quantité totale vendue* : ${s.totalQuantity || 0}
💰 *Chiffre d’affaires* : ${formatMoney(s.totalRevenue)}
💸 *Coût total* : ${formatMoney(s.totalCost)}
📈 *Profit total* : ${formatMoney(s.totalProfit)}
`;

/* -----------------------------
1️⃣ DAILY SUMMARY : chaque jour à 13h00 et 20h30
----------------------------- */
const dailyTimes = ["50 13 * * *", "30 20 * * *"];
dailyTimes.forEach((time) => {
cron.schedule(time, async () => {
try {
const { summary } = await getDailySummary(null, null, true);
if (!summary) {
console.warn("⚠️ Daily summary vide, message non envoyé");
return;
}
const msg = buildSummaryMessage("Résumé Quotidien", summary);
await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg, { parse_mode: "Markdown" });
console.log(`📩 Daily Summary envoyé (${time})`);
} catch (err) {
console.error("DailySummary CRON Error :", err);
}
});
});

/* -----------------------------
2️⃣ WEEKLY SUMMARY : chaque dimanche à 15h00 et tous les jours à 13h01 et 20h30
----------------------------- */
const weeklyTimes = ["51 13 * * 0", "32 14 * * *", "30 20 * * *"];
weeklyTimes.forEach((time) => {
cron.schedule(time, async () => {
try {
const { summary } = await getWeeklySummary(null, null, true);
if (!summary) {
console.warn("⚠️ Weekly summary vide, message non envoyé");
return;
}
const msg = buildSummaryMessage("Résumé Hebdomadaire", summary);
await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg, { parse_mode: "Markdown" });
console.log(`📩 Weekly Summary envoyé (${time})`);
} catch (err) {
console.error("WeeklySummary CRON Error :", err);
}
});
});

/* -----------------------------
3️⃣ MONTHLY SUMMARY : dernier jour du mois à 15h00
----------------------------- */
cron.schedule("0 15 * * *", async () => {
try {
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);


if (tomorrow.getMonth() !== today.getMonth()) { // dernier jour du mois
  const { summary } = await getMonthlySummaryForCron();
  if (!summary) {
    console.warn("⚠️ Monthly summary introuvable, message non envoyé");
    return;
  }
  const msg = buildSummaryMessage("Résumé Mensuel", summary);
  await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg, { parse_mode: "Markdown" });
  console.log("📩 Monthly Summary envoyé");
}


} catch (err) {
console.error("MonthlySummary CRON Error :", err);
}
});

/* -----------------------------
3️⃣.1 MONTHLY SUMMARY : tous les jours à 20h30 (optionnel)
----------------------------- */
cron.schedule("30 20 * * *", async () => {
try {
const { summary } = await getMonthlySummaryForCron();
if (!summary) return;
const msg = buildSummaryMessage("Résumé du mois", summary);
await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg, { parse_mode: "Markdown" });
console.log("📩 Monthly Summary envoyé");
} catch (err) {
console.error("MonthlySummary CRON Error :", err);
}
});

/* -----------------------------
4️⃣ ANNUAL SUMMARY : dernier jour de l’année à 19h30
----------------------------- */
cron.schedule("30 19 31 12 *", async () => {
try {
const { summary } = await getYearlySummary(null, null, true);
if (!summary) return;
const msg = buildSummaryMessage("Résumé Annuel", summary);
await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg, { parse_mode: "Markdown" });
console.log("📩 Annual Summary envoyé");
} catch (err) {
console.error("AnnualSummary CRON Error :", err);
}
});




/* -----------------------------
5️⃣ RESERVATIONS : veille et jour de livraison
----------------------------- */

const sendReservations = async (targetDate, label) => {
  try {
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const reservations = await saleModel.find({
      status: "reserved",
      deliveryDate: { $gte: start, $lt: end },
    }).populate("productId", "name image");

    if (!reservations.length) {
      console.log(`⚠️ Aucune réservation pour ${label}.`);
      return;
    }

    let message = `📦 *Réservations pour ${label} (${start.toLocaleDateString("fr-FR")})*\n\n`;
    reservations.forEach((resv, i) => {
      message += `*${i + 1}.* ${resv.productId?.name || resv.productName}\n`;
      if (resv.variantSize) message += `Taille/Variante : ${resv.variantSize}\n`;
      message += `Quantité : ${resv.quantity}\n`;
      message += `Prix total : ${formatMoney(resv.finalPrice)}\n`;
      if (resv.customerPhone) message += `📞 Client : wa.me//237${resv.customerPhone}\n`;
      if (resv.comment) message += `📝 Commentaire : ${resv.comment}\n`;
      message += `----------------------\n`;
    });

    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: "Markdown" });
    console.log(`📩 Réservations envoyées pour ${label}!`);
  } catch (err) {
    console.error("Reservation CRON Error :", err);
  }
};

// --- Cron pour la veille à 21h30 ---
cron.schedule("30 21 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await sendReservations(tomorrow, "demain");
});

// --- Cron pour le jour même à 06h00 ---
cron.schedule("0 6 * * *", async () => {
  const today = new Date();
  await sendReservations(today, "aujourd'hui (06h00)");
});

// --- Cron pour le jour même à 08h00 ---
cron.schedule("0 8 * * *", async () => {
  const today = new Date();
  await sendReservations(today, "aujourd'hui (08h00)");
});
