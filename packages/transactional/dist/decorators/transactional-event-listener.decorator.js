"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionalEventListener = void 0;
const common_1 = require("@nestjs/common");
const transactional_constant_1 = require("../transactional.constant");
const TransactionalEventListener = (event, options) => {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(transactional_constant_1.TRANSACTIONAL_EVENT_LISTENER_METADATA, {
        event,
        ...options,
    }));
};
exports.TransactionalEventListener = TransactionalEventListener;
//# sourceMappingURL=transactional-event-listener.decorator.js.map