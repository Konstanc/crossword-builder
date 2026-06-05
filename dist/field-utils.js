"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wpToFieldXY = void 0;
const wpToFieldXY = (wp, i) => wp.horizontal ? { x: wp.x + i, y: wp.y } : { x: wp.x, y: wp.y + i };
exports.wpToFieldXY = wpToFieldXY;
//# sourceMappingURL=field-utils.js.map