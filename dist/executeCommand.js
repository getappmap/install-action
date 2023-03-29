"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = void 0;
const child_process_1 = require("child_process");
const verbose_1 = __importDefault(require("./verbose"));
function executeCommand(cmd, printCommand = false, printStdout = false, printStderr = false) {
    if (printCommand || (0, verbose_1.default)())
        console.log(cmd);
    const command = (0, child_process_1.exec)(cmd);
    const result = [];
    const stderr = [];
    if (command.stdout) {
        command.stdout.addListener('data', data => {
            if (printStdout || (0, verbose_1.default)())
                process.stdout.write(data);
            result.push(data);
        });
    }
    if (command.stderr) {
        if (printStderr || (0, verbose_1.default)())
            command.stderr.pipe(process.stdout);
        else
            command.stderr.addListener('data', data => stderr.push(data));
    }
    return new Promise((resolve, reject) => {
        command.addListener('exit', code => {
            if (code === 0) {
                resolve(result.join(''));
            }
            else {
                if (!printCommand)
                    console.log(cmd);
                console.warn(stderr.join(''));
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}
exports.executeCommand = executeCommand;
