var _a, _b;
import { cloneElement, isValidElement } from "react";
export default function repeatedElement(index, elt) {
    return repeatedElementFn(index, elt);
}
let repeatedElementFn = (index, elt) => {
    if (Array.isArray(elt)) {
        return elt.map((v) => repeatedElementFn(index, v));
    }
    if (elt && isValidElement(elt) && typeof elt !== "string") {
        return cloneElement(elt);
    }
    return elt;
};
const root = globalThis;
export const setRepeatedElementFn = (_b = (_a = root === null || root === void 0 ? void 0 : root.__Sub) === null || _a === void 0 ? void 0 : _a.setRepeatedElementFn) !== null && _b !== void 0 ? _b : function (fn) {
    repeatedElementFn = fn;
};
