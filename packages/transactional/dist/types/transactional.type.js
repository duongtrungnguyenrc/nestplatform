"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionIsolation = exports.TransactionPropagation = void 0;
var TransactionPropagation;
(function (TransactionPropagation) {
    TransactionPropagation["REQUIRED"] = "REQUIRED";
    TransactionPropagation["REQUIRES_NEW"] = "REQUIRES_NEW";
    TransactionPropagation["NESTED"] = "NESTED";
})(TransactionPropagation || (exports.TransactionPropagation = TransactionPropagation = {}));
var TransactionIsolation;
(function (TransactionIsolation) {
    TransactionIsolation["READ_UNCOMMITTED"] = "READ UNCOMMITTED";
    TransactionIsolation["READ_COMMITTED"] = "READ COMMITTED";
    TransactionIsolation["REPEATABLE_READ"] = "REPEATABLE READ";
    TransactionIsolation["SERIALIZABLE"] = "SERIALIZABLE";
})(TransactionIsolation || (exports.TransactionIsolation = TransactionIsolation = {}));
//# sourceMappingURL=transactional.type.js.map