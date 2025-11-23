// server.js
import dotenv from 'dotenv';
import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import productRouter from './routes/productRoute.js';
import salesRouter from './routes/salesRoute.js';
import StockMovement from './models/stockMovementModel.js';
import stockMovementRoutes from './routes/stockMovementRoutes.js';
import userRouter from './routes/userRoute.js';
import telegramRoute from './routes/telegramRoute.js';
import './controllers/stateMessages.js';


const port = 5000;
const app = express();
app.use(cors());
dotenv.config();

// Middleware pour lire du JSON
app.use(express.json());

// 📦 Connexions DB et services
connectDB()

app.use("/api/products", productRouter);
app.use("/api/sales", salesRouter);
app.use("/api/stockMovementRoutes", stockMovementRoutes);
app.use('/api/user', userRouter);
// app.use('message',telegramRoute);
app.use("/telegram", telegramRoute); //hummm


// cors

app.use(cors({
  origin: [
    "http://localhost:3000", // Ton frontend local
    "https://inventory-qd-in.onrender.com", // admin link 
    "https://inventory2-uexd.onrender.com",  // backend
    "https://inventory-user-h4bt.onrender.com", //user

  ],
  credentials: true // si tu utilises cookies ou sessions
}));


// Exemple de route
app.get("/", (req, res) => {
  res.json({ message: "Hello depuis le backend avec CORS activé 🚀" });
});


app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`✅ Listening on http://localhost:${port}`);
});