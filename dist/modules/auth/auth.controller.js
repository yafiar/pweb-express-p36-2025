"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../lib/db");
const env_1 = require("../../config/env");
const auth_validator_1 = require("./auth.validator");
const SALT_ROUNDS = 10;
async function register(req, res) {
    const parsed = auth_validator_1.registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid body', errors: parsed.error.flatten() });
    }
    const { name, email, password } = parsed.data;
    const exists = await db_1.prisma.user.findUnique({ where: { email } });
    if (exists)
        return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
    const user = await db_1.prisma.user.create({
        data: { name, email, password: passwordHash },
        select: { id: true, name: true, email: true, createdAt: true },
    });
    return res.status(201).json({ user });
}
async function login(req, res) {
    const parsed = auth_validator_1.loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid body', errors: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ message: 'Invalid email or password' });
    const ok = await bcrypt_1.default.compare(password, user.password);
    if (!ok)
        return res.status(401).json({ message: 'Invalid email or password' });
    const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, env_1.env.jwtSecret, { expiresIn: '1d' });
    return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
    });
}
async function getMe(req, res) {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    const me = await db_1.prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!me)
        return res.status(404).json({ message: 'User not found' });
    return res.json({ user: me });
}
//# sourceMappingURL=auth.controller.js.map