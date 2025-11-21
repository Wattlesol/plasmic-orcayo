import { DataProvider, repeatedElement, useSelector, } from "@plasmicapp/host";
import { usePlasmicQueryData } from "@plasmicapp/query";
import { pascalCase } from "change-case";
import get from "dlv";
import React, { useContext } from "react";
import { queryOperators } from "./utils";
export function ensure(x) {
    if (x === null || x === undefined) {
        debugger;
        throw new Error(`Value must not be undefined or null`);
    }
    else {
        return x;
    }
}
const modulePath = "@plasmicpkgs/plasmic-content-stack";
const makeDataProviderName = (contentType) => `currentContentstack${pascalCase(contentType)}Item`;
const CredentialsContext = React.createContext(undefined);
export const ContentStackCredentialsProviderMeta = {
    name: "ContentStackCredentialsProvider",
    displayName: "ContentStack Credentials Provider",
    description: "The API key is a unique key assigned to each stack. Learn how to [get your API key](https://www.contentstack.com/docs/developers/apis/content-management-api/#how-to-get-stack-api-key).",
    importName: "ContentStackCredentialsProvider",
    importPath: modulePath,
    props: {
        apiKey: {
            type: "string",
            displayName: "API Key",
            description: "API Key of your Stack ",
            defaultValue: "blt02f7b45378b008ee",
        },
        accessToken: {
            type: "string",
            displayName: "Access Token ",
            description: "Access Token",
            defaultValue: "cs5b69faf35efdebd91d08bcf4",
        },
        environment: {
            type: "string",
            displayName: "Environment",
            defaultValue: "production",
        },
    },
};
export function ContentStackCredentialsProvider({ apiKey, accessToken, environment, children, }) {
    return (React.createElement(CredentialsContext.Provider, { value: { apiKey, accessToken, environment } }, children));
}
export const ContentStackFetcherMeta = {
    name: "ContentStackFetcher",
    displayName: "ContentStack Fetcher",
    importName: "ContentStackFetcher",
    importPath: modulePath,
    providesData: true,
    description: "Fetches ContentStack data and repeats content of children once for every row fetched. ",
    defaultStyles: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gridRowGap: "8px",
        gridColumnGap: "8px",
        padding: "8px",
        maxWidth: "100%",
    },
    props: {
        children: {
            type: "slot",
            defaultValue: {
                type: "vbox",
                styles: {
                    padding: "8px",
                },
                children: {
                    type: "component",
                    name: "ContentStackField",
                },
            },
        },
        contentType: {
            type: "choice",
            options: (props, ctx) => {
                var _a, _b;
                return (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.types) === null || _a === void 0 ? void 0 : _a.map((type) => ({
                    label: type === null || type === void 0 ? void 0 : type.title,
                    value: type === null || type === void 0 ? void 0 : type.uid,
                }))) !== null && _b !== void 0 ? _b : [];
            },
            displayName: "Content type",
            description: "Content type to be queried.",
        },
        filterField: {
            type: "choice",
            displayName: "Filter field",
            description: "Field (from Collection) to filter by",
            options: (props, ctx) => { var _a; return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.filterFields) !== null && _a !== void 0 ? _a : []; },
            hidden: (props, ctx) => !props.contentType,
        },
        queryOperator: {
            type: "choice",
            displayName: "Query Operator",
            description: "Query Operator filter by",
            options: (props, ctx) => { var _a; return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.queryOptions) !== null && _a !== void 0 ? _a : []; },
            hidden: (props, ctx) => !props.filterField,
        },
        filterValue: {
            type: "string",
            displayName: "Filter value",
            description: "Value to filter by, should be of filter field type",
        },
        limit: {
            type: "number",
            displayName: "Limit",
            description: "Limit",
        },
        noAutoRepeat: {
            type: "boolean",
            displayName: "No auto-repeat",
            description: "Do not automatically repeat children for every entries.",
            defaultValue: false,
        },
        noLayout: {
            type: "boolean",
            displayName: "No layout",
            description: "When set, ContentStack Fetcher will not layout its children; instead, the layout set on its parent element will be used. Useful if you want to set flex gap or control container tag type.",
            defaultValue: false,
        },
    },
};
export function ContentStackFetcher({ contentType, filterField, filterValue, queryOperator, limit, noAutoRepeat, children, className, noLayout, setControlContextData, }) {
    var _a, _b;
    const creds = ensure(useContext(CredentialsContext));
    const cacheKey = JSON.stringify({
        limit,
        contentType,
        filterField,
        filterValue,
        queryOperator,
        creds,
    });
    const allContentTypes = usePlasmicQueryData(`${cacheKey}/contentTypes`, async () => {
        const resp = await fetch("https://cdn.contentstack.io/v3/content_types?include_count=true&include_global_field_schema=true", {
            headers: {
                api_key: creds.apiKey,
                access_token: creds.accessToken,
            },
        });
        return resp.json();
    });
    const contentTypes = (_a = allContentTypes.data) !== null && _a !== void 0 ? _a : [];
    const { data: entriesData } = usePlasmicQueryData(contentType ? `${cacheKey}/${contentType}/entries` : null, async () => {
        const url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries?environment=${creds.environment}`;
        let query;
        if (limit) {
            query = `${url}&limit=${limit}`;
        }
        else {
            query = url;
        }
        const resp = await fetch(query, {
            headers: {
                api_key: creds.apiKey,
                access_token: creds.accessToken,
            },
        });
        return await resp.json();
    });
    const { data: filteredData } = usePlasmicQueryData(contentType && filterField && filterValue && entriesData
        ? `${cacheKey}/${contentType}/filtered`
        : null, async () => {
        if (!contentType &&
            !filterField &&
            !filterValue &&
            !entriesData &&
            !contentTypes) {
            return null;
        }
        const matched = Object.values(entriesData)
            .flatMap((model) => (Array.isArray(model) ? model : [model]))
            .map((item) => {
            const fields = Object.entries(item).find((el) => el[0] === filterField);
            return fields;
        });
        let url;
        if (!queryOperator) {
            Object.values(matched)
                .map((model) => (Array.isArray(model) ? model : [model]))
                .map((item) => {
                if (typeof item[1] === "number" && typeof item[1] !== "object") {
                    url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries?environment=${creds.environment}&query={"${filterField}" : ${filterValue}}`;
                }
                else if (typeof item[1] !== "number" &&
                    typeof item[1] !== "object" &&
                    typeof item[1] === "string") {
                    url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries?environment=${creds.environment}&query=${JSON.stringify({
                        [filterField]: filterValue,
                    })}`;
                }
                else {
                    url = "";
                }
            });
        }
        else if (queryOperator === "$ne" || queryOperator === "$regex") {
            Object.values(matched)
                .map((model) => (Array.isArray(model) ? model : [model]))
                .map((item) => {
                if (typeof item[1] === "number" && typeof item[1] !== "object") {
                    url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries?environment=${creds.environment}&query={"${filterField}":{"${queryOperator}":${filterValue}}}`;
                }
                else if (typeof item[1] !== "number" &&
                    typeof item[1] !== "object" &&
                    typeof item[1] === "string") {
                    url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries?environment=${creds.environment}&query=${JSON.stringify({
                        [filterField]: { [queryOperator]: filterValue },
                    })}`;
                }
                else {
                    url = "";
                }
            });
        }
        else {
            url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries?environment=${creds.environment}&query={"${filterField}":{"${queryOperator}" :${filterValue}}}`;
        }
        const resp = await fetch(url, {
            headers: {
                api_key: creds.apiKey,
                access_token: creds.accessToken,
            },
        });
        return await resp.json();
    });
    if (!contentTypes) {
        return React.createElement("div", null, "Please configure the ContentStack credentials");
    }
    const types = Object.values(contentTypes).flatMap((model) => {
        return model;
    });
    setControlContextData === null || setControlContextData === void 0 ? void 0 : setControlContextData({
        types: types,
    });
    if (!creds.apiKey || !creds.accessToken || !creds.environment) {
        return (React.createElement("div", null, "Please specify a valid API Credentials: API Key, Access Token and Environment"));
    }
    if (!entriesData) {
        return React.createElement("div", null, "Please specify content type ");
    }
    const fieldsForFilter = Object.values(entriesData)
        .flatMap((model) => (Array.isArray(model) ? model : [model]))
        .map((item) => {
        const fields = Object.keys(item).filter((field) => {
            const value = get(item, field);
            return ((typeof value !== "object" &&
                field !== "images" &&
                typeof value === "number") ||
                (typeof value === "string" &&
                    !value.match(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/gm) &&
                    !value.match(/^blt.*/)));
        });
        return fields;
    });
    let operators;
    const matchedFields = Object.values(entriesData)
        .flatMap((model) => (Array.isArray(model) ? model : [model]))
        .map((item) => {
        const fields = Object.entries(item).find((el) => el[0] === filterField);
        return fields;
    });
    Object.values(matchedFields)
        .map((model) => (Array.isArray(model) ? model : [model]))
        .map((item) => {
        if (typeof item[1] === "number" && typeof item[1] !== "object") {
            operators = queryOperators;
        }
        else if (typeof item[1] !== "number" &&
            typeof item[1] !== "object" &&
            typeof item[1] === "string") {
            operators = [
                {
                    value: "",
                    label: "Is",
                },
                {
                    value: "$ne",
                    label: "Is not",
                },
                {
                    value: "$regex",
                    label: "Matches regex",
                },
            ];
        }
    });
    setControlContextData === null || setControlContextData === void 0 ? void 0 : setControlContextData({
        queryOptions: operators,
        types: types,
        filterFields: fieldsForFilter[0],
    });
    if (queryOperator && !filterValue && !filterField) {
        return React.createElement("div", null, "Please specify a Filter Field and a Filter Value");
    }
    if (!queryOperator && filterValue && !filterField) {
        return React.createElement("div", null, "Please specify a Query Operator and a Filter Field");
    }
    if (!queryOperator && !filterValue && filterField) {
        return React.createElement("div", null, "Please specify a Query Operator and a Filter Value");
    }
    if (queryOperator && filterValue && !filterField) {
        return React.createElement("div", null, "Please specify a Filter Field");
    }
    if (queryOperator && !filterValue && filterField) {
        return React.createElement("div", null, "Please specify a Filter Value");
    }
    const entries = Object.values(entriesData).flatMap((item) => Array.isArray(item) ? item : [item]);
    let renderedData;
    if (filteredData) {
        const filtered = Object.values(filteredData).flatMap((model) => model)
            .length;
        if (filtered === 0) {
            return React.createElement("div", null, "No published entry found ");
        }
        const entries = Object.values(filteredData).flatMap((model) => Array.isArray(model) ? model : [model]);
        renderedData = entries === null || entries === void 0 ? void 0 : entries.map((item, index) => (React.createElement(DataProvider, { key: item._id, name: "contentstackItem", data: item, hidden: true },
            React.createElement(DataProvider, { name: makeDataProviderName(contentType), data: item }, repeatedElement(index, children)))));
    }
    else {
        const entries = Object.values(entriesData).flatMap((model) => Array.isArray(model) ? model : [model]);
        renderedData = entries === null || entries === void 0 ? void 0 : entries.map((item, index) => (React.createElement(DataProvider, { key: item._id, name: "contentstackItem", data: item, hidden: true },
            React.createElement(DataProvider, { name: makeDataProviderName(contentType), data: item }, repeatedElement(index, children)))));
    }
    return (React.createElement(DataProvider, { data: entries, name: "contentStackItems" }, noAutoRepeat ? (children) : (React.createElement(DataProvider, { name: "contentstackSchema", data: (_b = types === null || types === void 0 ? void 0 : types.find((type) => type.uid === contentType)) === null || _b === void 0 ? void 0 : _b.schema, hidden: true }, noLayout ? (React.createElement(React.Fragment, null,
        " ",
        renderedData,
        " ")) : (React.createElement("div", { className: className },
        " ",
        renderedData,
        " "))))));
}
export const ContentStackFieldMeta = {
    name: "ContentStackField",
    displayName: "ContentStack Field",
    importName: "ContentStackField",
    importPath: modulePath,
    props: {
        objectPath: {
            type: "dataSelector",
            data: (props, ctx) => { var _a; return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.data) !== null && _a !== void 0 ? _a : {}; },
            displayName: "Field",
            description: "Field to be displayed.",
        },
    },
};
export function ContentStackField({ objectPath, setControlContextData, ...rest }) {
    var _a;
    const item = useSelector("contentstackItem");
    if (!item) {
        return (React.createElement("div", null, "ContentStackField must be used within a ContentStackFetcher "));
    }
    const schema = useSelector("contentstackSchema");
    setControlContextData === null || setControlContextData === void 0 ? void 0 : setControlContextData({
        data: item,
    });
    if (!objectPath) {
        return React.createElement("div", null, "Please specify a valid path or select a field.");
    }
    const isRichText = () => {
        var _a, _b;
        return (_b = (_a = schema === null || schema === void 0 ? void 0 : schema.find((field) => field.uid === get(objectPath, [0]))) === null || _a === void 0 ? void 0 : _a.field_metadata) === null || _b === void 0 ? void 0 : _b.allow_rich_text;
    };
    const data = get(item, objectPath);
    if (typeof data === "object" && ((_a = data === null || data === void 0 ? void 0 : data.content_type) === null || _a === void 0 ? void 0 : _a.startsWith("image"))) {
        return React.createElement("img", { ...rest, src: data.url });
    }
    else if (!data || typeof data === "object") {
        return React.createElement("div", { ...rest }, " Please specify a valid field.");
    }
    else if (isRichText()) {
        return React.createElement("div", { ...rest, dangerouslySetInnerHTML: { __html: data } });
    }
    else {
        return React.createElement("div", { ...rest },
            " ",
            data,
            " ");
    }
}
