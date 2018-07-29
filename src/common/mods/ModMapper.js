"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ModMapper {
    // no it can't
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(filesToDelete) {
        this.filesToDelete = filesToDelete || [];
    }
    getFilesToDelete() {
        return this.filesToDelete;
    }
}
exports.ModMapper = ModMapper;
//# sourceMappingURL=ModMapper.js.map