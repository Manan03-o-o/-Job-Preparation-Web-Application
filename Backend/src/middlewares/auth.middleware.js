const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    try {
        // 🔥 SAFE token extraction
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token not provided."
            });
        }

        const token = authHeader.split(" ")[1];

        // 🔥 check blacklist
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Token is invalid"
            });
        }

        // 🔥 verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (err) {
        console.error("authUser error:", err?.message);

        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
}

module.exports = { authUser };