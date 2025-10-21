"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middleware/auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', auth_controller_1.register);
exports.authRouter.post('/login', auth_controller_1.login);
exports.authRouter.get('/me', auth_1.requireAuth, auth_controller_1.getMe);
//# sourceMappingURL=auth.router.js.map