import React, { createContext, useContext, useMemo, } from "react";
import { tuple } from "./common";
export const DataContext = createContext(undefined);
export function mkMetaName(name) {
    return `__plasmic_meta_${name}`;
}
export function mkMetaValue(meta) {
    return meta;
}
export function applySelector(rawData, selector) {
    if (!selector) {
        return undefined;
    }
    let curData = rawData;
    for (const key of selector.split(".")) {
        curData = curData === null || curData === void 0 ? void 0 : curData[key];
    }
    return curData;
}
export function useSelector(selector) {
    const rawData = useDataEnv();
    return applySelector(rawData, selector);
}
export function useSelectors(selectors = {}) {
    const rawData = useDataEnv();
    return Object.fromEntries(Object.entries(selectors)
        .filter(([key, selector]) => !!key && !!selector)
        .map(([key, selector]) => tuple(key, applySelector(rawData, selector))));
}
export function useDataEnv() {
    return useContext(DataContext);
}
export function DataProvider({ name, data, hidden, advanced, label, children, }) {
    const parentContext = useDataEnv();
    const childContext = useMemo(() => {
        if (!name) {
            return null;
        }
        return {
            ...parentContext,
            [name]: data,
            [mkMetaName(name)]: mkMetaValue({ hidden, advanced, label }),
        };
    }, [parentContext, name, data, hidden, advanced, label]);
    if (childContext === null) {
        return React.createElement(React.Fragment, null, children);
    }
    else {
        return (React.createElement(DataContext.Provider, { value: childContext }, children));
    }
}
/**
 * This transforms `{ "...slug": "a/b/c" }` into `{ "slug": ["a", "b", "c"] }.
 */
function fixCatchallParams(params) {
    const newParams = {};
    for (const [key, value] of Object.entries(params)) {
        if (!value) {
            continue;
        }
        if (key.startsWith("...")) {
            newParams[key.slice(3)] =
                typeof value === "string"
                    ? value.replace(/^\/|\/$/g, "").split("/")
                    : value;
        }
        else {
            newParams[key] = value;
        }
    }
    return newParams;
}
function mkPathFromRouteAndParams(route, params) {
    if (!params) {
        return route;
    }
    let path = route;
    for (const [key, value] of Object.entries(params)) {
        if (typeof value === "string") {
            path = path.replace(`[${key}]`, value);
        }
        else if (Array.isArray(value)) {
            if (path.includes(`[[...${key}]]`)) {
                path = path.replace(`[[...${key}]]`, value.join("/"));
            }
            else if (path.includes(`[...${key}]`)) {
                path = path.replace(`[...${key}]`, value.join("/"));
            }
        }
    }
    return path;
}
export function PageParamsProvider({ children, route, path: deprecatedRoute, params = {}, query = {}, }) {
    route = route !== null && route !== void 0 ? route : deprecatedRoute;
    params = fixCatchallParams(params);
    const $ctx = useDataEnv() || {};
    const path = route ? mkPathFromRouteAndParams(route, params) : undefined;
    return (React.createElement(DataProvider, { name: "pageRoute", data: route, label: "Page route", advanced: true },
        React.createElement(DataProvider, { name: "pagePath", data: path, label: "Page path" },
            React.createElement(DataProvider, { name: "params", data: { ...$ctx.params, ...params }, label: "Page URL path params" },
                React.createElement(DataProvider, { name: "query", data: { ...$ctx.query, ...query }, label: "Page URL query params" }, children)))));
}
export function DataCtxReader({ children, }) {
    const $ctx = useDataEnv();
    return children($ctx);
}
