import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../controllers/userController.js';
import { adminEmail, adminPassword } from '../config/OauthKeys.js';



const adminAuth = async (req, res, next) => {
  try {
      const {token} = req.headers
      if (!token) {
        return res.json({ success: false, message: "Not authorized Login Again" });
      }
      const token_decode = jwt.verify(token, JWT_SECRET);
      if (token_decode !==adminEmail + adminPassword) {
        return res.json({ success: false, message: "Nott authorized Login Again" });
      }
    next();
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };


  //   const authHeader = req.headers.authorization;
  //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //     return res.json({ success: false, message: "NotT authorized" });
  //   }

  //   const token = authHeader.split(" ")[1];
  //   const decoded = jwt.verify(token, JWT_SECRET);

  //   // Vérifie que c'est bien l'admin par email
  //   if (decoded.email !== adminEmail) {
  //     return res.json({ success: false, message: "Not authorized" });
  //   }

  

export default adminAuth;
