import express from 'express'
import { adminLogin, userLogin } from '../controllers/userController.js';



const userRouter = express.Router();
userRouter.post('/login',userLogin)

userRouter.post('/admin/login',adminLogin)

// userRouter.get('/profile', getProfile);
// userRouter.post("/google", google)

export default userRouter;

