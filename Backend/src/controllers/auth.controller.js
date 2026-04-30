const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

/**
 * REGISTER
 */
async function registerUserController(req, res) {
    try {
        let { username, email, password } = req.body;

        // 🔥 trim inputs
        username = username?.trim();
        email = email?.trim();
        password = password?.trim();

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("registerUserController error:", err?.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * LOGIN
 */
async function loginUserController(req, res) {
    try {
        let { email, password } = req.body;

        email = email?.trim();
        password = password?.trim();

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("loginUserController error:", err?.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * LOGOUT
 */
async function logoutUserController(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (token) {
            await tokenBlacklistModel.create({ token });
        }

        return res.status(200).json({
            message: "User logged out successfully"
        });

    } catch (err) {
        console.error("logoutUserController error:", err?.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * GET ME
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("getMeController error:", err?.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};