"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPhase = exports.TransactionIsolation = exports.TransactionPropagation = void 0;
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
var TransactionPhase;
(function (TransactionPhase) {
    TransactionPhase["BEFORE_COMMIT"] = "BEFORE_COMMIT";
    TransactionPhase["AFTER_COMMIT"] = "AFTER_COMMIT";
    TransactionPhase["AFTER_ROLLBACK"] = "AFTER_ROLLBACK";
    TransactionPhase["AFTER_COMPLETION"] = "AFTER_COMPLETION";
})(TransactionPhase || (exports.TransactionPhase = TransactionPhase = {}));
//# sourceMappingURL=transactional.type.js.map