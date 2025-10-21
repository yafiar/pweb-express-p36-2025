"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
exports.env = {
    jwtSecret: process.env.JWT_SECRET || 'dev_secret',
    nodeEnv: process.env.NODE_ENV || 'development',
};
//# sourceMappingURL=env.js.map