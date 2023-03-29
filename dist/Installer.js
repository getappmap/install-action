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
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const os_1 = require("os");
const path_1 = require("path");
const downloadFile_1 = require("./downloadFile");
const executeCommand_1 = require("./executeCommand");
class Installer {
    constructor(appmapToolsURL, logger = console) {
        this.appmapToolsURL = appmapToolsURL;
        this.logger = logger;
        this.appmapToolsPath = (0, path_1.join)((0, os_1.tmpdir)(), 'appmap');
    }
    installAppMapTools() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, downloadFile_1.downloadFile)(new URL(this.appmapToolsURL), this.appmapToolsPath);
            yield (0, promises_1.chmod)(this.appmapToolsPath, 0o755);
            this.logger.info(`AppMap tools are installed at ${this.appmapToolsPath}`);
        });
    }
    installAppMapLibrary() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.appmapConfig) {
                yield (0, promises_1.writeFile)('.appmap.yml', this.appmapConfig);
            }
            yield (0, executeCommand_1.executeCommand)(`${this.appmapToolsPath} install --no-interactive --no-overwrite-appmap-config`);
            this.logger.info(`AppMap language library has been installed and configured.`);
        });
    }
}
exports.default = Installer;
