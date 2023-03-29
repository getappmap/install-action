"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let isVerbose = false;
function verbose(v) {
    if (v !== undefined) {
        isVerbose = v;
    }
    return isVerbose;
}
exports.default = verbose;
