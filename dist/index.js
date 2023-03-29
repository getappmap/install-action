"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const Installer_1 = __importDefault(require("./Installer"));
const verbose_1 = __importDefault(require("./verbose"));
class ActionLogger {
    info(message) {
        core.info(message);
    }
    warn(message) {
        core.warning(message);
    }
}
function usage() {
    return `Usage: node ${process.argv[1]} <appmap-tools-url>`;
}
function runInGitHub() {
    core.debug(`Env var 'CI' is set. Running as a GitHub action.`);
    (0, verbose_1.default)(core.getBooleanInput('verbose'));
    const appmapConfig = core.getInput('appmap-config');
    const appmapToolsURL = core.getInput('tools-url');
    const installer = new Installer_1.default(appmapToolsURL, new ActionLogger());
    if (appmapConfig)
        installer.appmapConfig = appmapConfig;
    return installer;
}
function runAsScript() {
    console.log(`Env var 'CI' is not set. Running as a local script.`);
    const appmapToolsURL = process.argv[2];
    if (!appmapToolsURL)
        throw new Error(usage());
    const installer = new Installer_1.default(appmapToolsURL);
    return installer;
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    let installer;
    if (process.env.CI)
        installer = runInGitHub();
    else
        installer = runAsScript();
    yield installer.installAppMapTools();
    yield installer.installAppMapLibrary();
}))();
