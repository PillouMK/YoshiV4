"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonStore = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
class JsonStore {
    filePath;
    defaultValue;
    constructor(filePath, defaultValue) {
        this.filePath = filePath;
        this.defaultValue = defaultValue;
    }
    load() {
        if (!fs_1.default.existsSync(this.filePath)) {
            this.save(this.defaultValue);
        }
        return JSON.parse(fs_1.default.readFileSync(this.filePath, "utf-8"));
    }
    save(data) {
        fs_1.default.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    }
}
exports.JsonStore = JsonStore;
