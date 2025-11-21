function isString(x) {
    return typeof x === "string";
}
export function ensure(x, msg = "") {
    if (x === null || x === undefined) {
        debugger;
        msg = (isString(msg) ? msg : msg()) || "";
        throw new Error(`Value must not be undefined or null${msg ? `- ${msg}` : ""}`);
    }
    else {
        return x;
    }
}
