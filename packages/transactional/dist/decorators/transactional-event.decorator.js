"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionalEvent = void 0;
const common_1 = require("@nestjs/common");
const transactional_constant_1 = require("../transactional.constant");
const TransactionalEvent = (event, options) => {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(transactional_constant_1.TRANSACTIONAL_EVENT_METADATA, {
        event,
        ...options,
    }));
};
exports.TransactionalEvent = TransactionalEvent;
//# sourceMappingURL=transactional-event.decorator.js.map