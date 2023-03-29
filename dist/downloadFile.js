"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = void 0;
const assert_1 = __importDefault(require("assert"));
const fs_1 = require("fs");
const node_fetch_1 = __importDefault(require("node-fetch"));
function downloadFile(url, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield (0, node_fetch_1.default)(url);
        if (!res)
            throw new Error(`Could not download ${url}`);
        if (!res.body)
            throw new Error(`Response body for ${url} is empty`);
        const fileStream = (0, fs_1.createWriteStream)(path);
        yield new Promise((resolve, reject) => {
            (0, assert_1.default)(res.body);
            res.body.pipe(fileStream);
            res.body.on('error', reject);
            fileStream.on('finish', resolve);
        });
    });
}
exports.downloadFile = downloadFile;
