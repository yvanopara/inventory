import { adminEmail, adminPassword, userEmail, userPassword } from "../config/OauthKeys.js";
import jwt from 'jsonwebtoken';
//jwt token
const JWT_SECRET = "random#Secret";


const userLogin = async (req, res) => {
    try {

        const { email, password } = req.body
        if (email === userEmail && password === userPassword) {
            const token = jwt.sign(email + password, JWT_SECRET);
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, message: 'invalid credentials' })
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}




const adminLogin = async (req, res) => {
    try {

        const { email, password } = req.body
        if (email === adminEmail && password === adminPassword) {
            const token = jwt.sign(email + password, JWT_SECRET);
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, message: 'invalid credentials' })
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export {userLogin,  adminLogin, JWT_SECRET };