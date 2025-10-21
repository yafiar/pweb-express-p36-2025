"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = require("./modules/auth/auth.router");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_router_1.authRouter);
// error handler sederhana
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
});
exports.default = app;
//# sourceMappingURL=app.js.map