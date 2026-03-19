"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TRANSACTION_ADAPTER = exports.TRANSACTION_ADAPTERS = exports.TRANSACTIONAL_EVENT_METADATA = exports.TRANSACTIONAL_EVENT_LISTENER_METADATA = exports.NO_TRANSACTIONAL_METADATA = exports.TRANSACTIONAL_METADATA = void 0;
exports.TRANSACTIONAL_METADATA = Symbol.for("metadata:transactional");
exports.NO_TRANSACTIONAL_METADATA = Symbol.for("metadata:no_transactional");
exports.TRANSACTIONAL_EVENT_LISTENER_METADATA = Symbol.for("metadata:transactional_event_listener");
exports.TRANSACTIONAL_EVENT_METADATA = Symbol.for("metadata:transactional_event");
exports.TRANSACTION_ADAPTERS = Symbol.for("token:TRANSACTION_ADAPTERS");
exports.DEFAULT_TRANSACTION_ADAPTER = "default";
//# sourceMappingURL=transactional.constant.js.map