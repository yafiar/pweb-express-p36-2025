"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function requireAuth(req, res, next) {
    const header = req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token)
        return res.status(401).json({ message: 'Missing Authorization header' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        if (typeof decoded === 'string') {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        const payload = decoded;
        const subRaw = payload.sub;
        const email = payload.email;
        const subNum = typeof subRaw === 'string' ? Number(subRaw) : subRaw;
        if (!subNum || !email) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        req.user = { sub: subNum, email };
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.js.map