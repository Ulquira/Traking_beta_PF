"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = __importDefault(require("./db.js"));
async function test() {
    const [rows] = await db_js_1.default.query('SELECT token_seguimiento FROM OPERACION LIMIT 5');
    console.log(rows);
    process.exit(0);
}
test();
