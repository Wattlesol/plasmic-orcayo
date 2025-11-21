import { DataProvider, repeatedElement, useSelector, } from "@plasmicapp/host";
import { usePlasmicQueryData } from "@plasmicapp/query";
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { pascalCase } from "change-case";
import get from "dlv";
import React, { useContext } from "react";
import { filterParameters } from "./utils";
export function ensure(x) {
    if (x === null || x === undefined) {
        throw new Error(`Value must not be undefined or null`);
    }
    else {
        return x;
    }
}
const modulePath = "@plasmicpkgs/plasmic-sanity-io";
const makeDataProviderName = (docType) => `currentSanity${pascalCase(docType)}Item`;
function makeSanityClient(creds) {
    const sanity = createClient({
        projectId: creds.projectId,
        dataset: creds.dataset,
        apiVersion: creds.apiVersion ? creds.apiVersion : "v1",
        token: creds.token,
        useCdn: creds.useCdn,
    });
    return sanity;
}
const CredentialsContext = React.createContext(undefined);
export const sanityCredentialsProviderMeta = {
    name: "SanityCredentialsProvider",
    displayName: "Sanity Credentials Provider",
    description: `Get your project ID, dataset, and token [here](https://www.sanity.io/manage).

Add 'https://host.plasmicdev.com' (or your app host origin) as an authorized host in the CORS origins section of your Sanity project.

[See tutorial video](https://www.youtube.com/watch?v=dLeu7I4RsYg).`,
    importName: "SanityCredentialsProvider",
    importPath: modulePath,
    props: {
        projectId: {
            type: "string",
            displayName: "Project ID",
            defaultValueHint: "b2gfz67v",
            defaultValue: "b2gfz67v",
            description: "The ID of the project to use.",
        },
        dataset: {
            type: "string",
            displayName: "Dataset",
            defaultValueHint: "production",
            defaultValue: "production",
            description: "The dataset to use.",
        },
        apiVersion: {
            type: "string",
            displayName: "API Version",
            defaultValueHint: "v1",
            description: "The API version to use (if not set, 'v1' will be used) - see https://www.sanity.io/docs/js-client#specifying-api-version.",
        },
        token: {
            type: "string",
            displayName: "Token",
            description: "The token to use (or leave blank for unauthenticated usage) - you can create tokens in the API section of your project (i.e. https://www.sanity.io/manage/personal/project/PROJECT_ID/api#tokens).",
        },
        useCdn: {
            type: "boolean",
            displayName: "Use CDN?",
            defaultValueHint: false,
            description: "Whether you want to use CDN ('false' if you want to ensure fresh data).",
        },
    },
};
export function SanityCredentialsProvider({ projectId, dataset, apiVersion, token, useCdn, children, }) {
    return (React.createElement(CredentialsContext.Provider, { value: { projectId, dataset, apiVersion, token, useCdn } }, children));
}
export const sanityFetcherMeta = {
    name: "SanityFetcher",
    displayName: "Sanity Fetcher",
    importName: "SanityFetcher",
    importPath: modulePath,
    providesData: true,
    description: `Fetches Sanity data of a given collection, and repeats \`children\` slot content for each row fetched.

[See tutorial video](https://www.youtube.com/watch?v=1SLoVY3hkQ4) and [GROQ cheat sheet](https://www.sanity.io/docs/query-cheat-sheet).`,
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
                    name: "SanityField",
                },
            },
        },
        groq: {
            type: "string",
            displayName: "GROQ",
            description: "Query in GROQ.",
            defaultValueHint: "*[_type == 'movie']",
            // Hide this if there's no groq, AND there's docType, so we're in
            // "docType" mode
            hidden: (props) => !props.groq && !!props.docType,
        },
        docType: {
            type: "choice",
            options: (props, ctx) => {
                var _a;
                return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.docTypes) !== null && _a !== void 0 ? _a : [];
            },
            displayName: "Document type",
            description: "Document type to be queried (*[_type == DOC_TYPE] shortcut).",
            // Hide this if groq is specified, as groq always takes precedence
            hidden: (props) => !!props.groq,
        },
        filterField: {
            type: "choice",
            displayName: "Filter field",
            description: "Field (from Collection) to filter by",
            options: (props, ctx) => { var _a; return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.sanityFields) !== null && _a !== void 0 ? _a : []; },
            // Hide this if there's groq (so we're just using groq), or if there's
            // no docType selected yet
            hidden: (props) => !!props.groq || !props.docType,
        },
        filterParameter: {
            type: "choice",
            displayName: "Filter Operation",
            description: "Filter Option to filter by. Read more (https://www.sanity.io/docs/groq-operators#3b7211e976f6)",
            options: (props, ctx) => { var _a; return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.queryOptions) !== null && _a !== void 0 ? _a : []; },
            // Hide if in groq mode, or if no filter field is selected yet
            hidden: (props) => !!props.groq || !props.filterField,
        },
        filterValue: {
            type: "string",
            displayName: "Filter value",
            description: "Value to filter by, should be of filter field type",
            // Hide if in groq mode, or if no filter field is selected yet
            hidden: (props) => !!props.groq || !props.filterField,
        },
        limit: {
            type: "string",
            displayName: "Limit",
            description: "Limit",
            // Hide if in groq mode
            hidden: (props) => !!props.groq || !props.docType,
        },
        noAutoRepeat: {
            type: "boolean",
            displayName: "No auto-repeat",
            description: "Do not automatically repeat children for every category.",
            defaultValue: false,
        },
        noLayout: {
            type: "boolean",
            displayName: "No layout",
            description: "When set, Sanity Fetcher will not layout its children; instead, the layout set on its parent element will be used. Useful if you want to set flex gap or control container tag type.",
            defaultValue: false,
        },
    },
};
export function SanityFetcher({ groq, docType, filterField, filterValue, filterParameter, limit, noAutoRepeat, children, className, noLayout, setControlContextData, }) {
    var _a;
    const projectIdRegex = new RegExp(/^[-a-z0-9]+$/i);
    const datasetRegex = new RegExp(/^(~[a-z0-9]{1}[-\w]{0,63}|[a-z0-9]{1}[-\w]{0,63})$/);
    const dateRegex = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    const creds = ensure(useContext(CredentialsContext));
    if (!creds.projectId || !projectIdRegex.test(creds.projectId)) {
        return (React.createElement("div", { className: className }, "Please specify a valid projectId, it can only contain only a-z, 0-9 and dashes."));
    }
    else if (!creds.dataset || !datasetRegex.test(creds.dataset)) {
        return (React.createElement("div", { className: className }, "Please specify a valid dataset, they can only contain lowercase characters, numbers, underscores and dashes, and start with tilde, and be maximum 64 characters."));
    }
    else if (creds.apiVersion) {
        if (creds.apiVersion !== "v1" &&
            creds.apiVersion !== "1" &&
            creds.apiVersion !== "X") {
            const date = new Date(creds.apiVersion);
            if (!(dateRegex.test(creds.apiVersion) &&
                date instanceof Date &&
                date.getTime() > 0)) {
                return (React.createElement("div", { className: className }, "Please specify a valid API version, expected `v1`, `1` or date in format `YYYY-MM-DD`."));
            }
        }
    }
    const filterUniqueDocTypes = (records) => records
        .map((record) => record._type)
        .reduce((acc, type) => {
        if (!acc.includes(type)) {
            acc.push(type);
        }
        return acc;
    }, []);
    const allDataTypes = usePlasmicQueryData(JSON.stringify(creds) + "/SANITY_DOCTYPES", async () => {
        const sanity = makeSanityClient(creds);
        const resp = await sanity.fetch("*{_type}").then(filterUniqueDocTypes);
        return resp;
    });
    const docTypes = (_a = allDataTypes.data) !== null && _a !== void 0 ? _a : false;
    const hasFilter = !!docType && !!filterField && !!filterParameter && !!filterValue;
    const generateUnfilteredGroq = () => {
        if (groq) {
            console.log("ORIG GROQ", groq);
            return groq;
        }
        else if (docType) {
            let query = `*[_type=='${docType}']`;
            if (hasFilter) {
                // Ask for only a small sample, so we know how to generate the filter
                query += `[0...10]`;
            }
            else if (limit) {
                query += `[0...${limit}]`;
            }
            console.log("UNFILTERED GROQ", query);
            return query;
        }
        else {
            return null;
        }
    };
    const unfilteredQuery = generateUnfilteredGroq();
    const sanity = makeSanityClient(creds);
    const { data: unfilteredData } = usePlasmicQueryData(unfilteredQuery
        ? JSON.stringify({ fullQuery: unfilteredQuery, creds })
        : null, async () => {
        return sanity.fetch(unfilteredQuery);
    });
    const generateFilteredQuery = () => {
        if (!hasFilter || !unfilteredData) {
            return null;
        }
        const fieldValues = Object.values(unfilteredData)
            .flatMap((model) => (Array.isArray(model) ? model : [model]))
            .map((item) => {
            const field = Object.entries(item).find((el) => el[0] === filterField);
            return field === null || field === void 0 ? void 0 : field[1];
        });
        let query = `*[_type=='${docType}'`;
        if (fieldValues.some((v) => typeof v === "string")) {
            query = `${query} && ${filterField} ${filterParameter} "${filterValue}"`;
        }
        else {
            query = `${query} && ${filterField} ${filterParameter} ${filterValue}`;
        }
        if (limit) {
            query = `${query}][0...${limit}]`;
        }
        else {
            query = `${query}]`;
        }
        console.log("FILTERED GROQ", query);
        return query;
    };
    const filteredQuery = generateFilteredQuery();
    const { data: filteredData } = usePlasmicQueryData(filteredQuery ? JSON.stringify({ filteredQuery, creds }) : null, async () => {
        const resp = await sanity.fetch(filteredQuery);
        return resp;
    });
    if (!docTypes) {
        return (React.createElement("div", { className: className }, "Please configure the Sanity provider with a valid projectId, dataset, and token (if necessary). Don't forget to add 'https://host.plasmicdev.com' as an authorized host on the CORS origins section of your project."));
    }
    setControlContextData === null || setControlContextData === void 0 ? void 0 : setControlContextData({
        docTypes,
    });
    if (!groq && !docType) {
        return (React.createElement("div", { className: className }, "Please specify a valid GROQ query or select a Document type."));
    }
    if (!unfilteredData) {
        return React.createElement("div", { className: className }, "Loading...");
    }
    let sanityFields = unfilteredData.map((item) => {
        const fields = Object.keys(item).filter((field) => {
            const value = get(item, field);
            return ((typeof value !== "object" &&
                value._type !== "image" &&
                typeof value === "number") ||
                (typeof value === "string" &&
                    !value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)));
        });
        return fields;
    });
    let operators;
    const matchedFields = Object.values(unfilteredData)
        .flatMap((model) => (Array.isArray(model) ? model : [model]))
        .map((item) => {
        const fields = Object.entries(item).find((el) => el[0] === filterField);
        return fields;
    });
    Object.values(matchedFields)
        .map((model) => (Array.isArray(model) ? model : [model]))
        .map((item) => {
        if (typeof item[1] === "number" && typeof item[1] !== "object") {
            operators = filterParameters;
        }
        else if (typeof item[1] !== "number" &&
            typeof item[1] !== "object" &&
            typeof item[1] === "string") {
            operators = [
                {
                    value: "==",
                    label: "Equals",
                },
                {
                    value: "!=",
                    label: "Not equals",
                },
            ];
        }
    });
    setControlContextData === null || setControlContextData === void 0 ? void 0 : setControlContextData({
        queryOptions: operators,
        docTypes,
        sanityFields: sanityFields[0],
    });
    if (hasFilter) {
        if (!filterParameter) {
            return React.createElement("div", { className: className }, "Please specify a filter operation");
        }
        if (!filterValue) {
            return React.createElement("div", { className: className }, "Please specify a filter value");
        }
    }
    if (hasFilter && !filteredData) {
        return React.createElement("div", { className: className }, "Loading...");
    }
    const resultData = hasFilter ? filteredData : unfilteredData;
    const imageBuilder = imageUrlBuilder(sanity);
    const repElements = noAutoRepeat
        ? children
        : resultData.map((item, index) => {
            Object.keys(item).forEach((field) => {
                if (item[field] != null && item[field]._type === "image") {
                    item[field].imgUrl = imageBuilder
                        .image(item[field])
                        .ignoreImageParams()
                        .toString();
                }
            });
            return docType ? (React.createElement(DataProvider, { key: item._id, name: "sanityItem", data: item, hidden: true },
                React.createElement(DataProvider, { name: makeDataProviderName(docType), data: item }, repeatedElement(index, children)))) : (React.createElement(DataProvider, { key: item._id, name: "sanityItem", data: item }, repeatedElement(index, children)));
        });
    return (React.createElement(DataProvider, { name: "sanityItems", data: resultData }, noLayout ? (React.createElement(React.Fragment, null,
        " ",
        repElements,
        " ")) : (React.createElement("div", { className: className },
        " ",
        repElements,
        " "))));
}
export const sanityFieldMeta = {
    name: "SanityField",
    displayName: "Sanity Field",
    importName: "SanityField",
    importPath: modulePath,
    props: {
        path: {
            type: "string",
            displayName: "Path",
            description: "Field path - see https://www.sanity.io/docs/ids.",
            defaultValueHint: "castMembers.0._key",
        },
        field: {
            type: "choice",
            options: (props, ctx) => {
                var _a;
                return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.fields) !== null && _a !== void 0 ? _a : [];
            },
            displayName: "Field",
            description: "Field to be displayed.",
        },
    },
};
export function SanityField({ className, path, field, setControlContextData, }) {
    const item = useSelector("sanityItem");
    if (!item) {
        return React.createElement("div", null, "SanityField must be used within a SanityFetcher");
    }
    // Getting only fields that aren't objects
    const displayableFields = Object.keys(item).filter((f) => {
        const value = get(item, f);
        return typeof value !== "object" || value._type === "image";
    });
    setControlContextData === null || setControlContextData === void 0 ? void 0 : setControlContextData({
        fields: displayableFields,
        isImage: false,
    });
    if (!path && !field) {
        return React.createElement("div", null, "Please specify a valid path or select a field.");
    }
    if (!path) {
        path = field;
    }
    const data = get(item, path);
    setControlContextData === null || setControlContextData === void 0 ? void 0 : setControlContextData({
        fields: displayableFields,
        isImage: (data === null || data === void 0 ? void 0 : data._type) == "image",
    });
    if (!data) {
        return React.createElement("div", null, "Please specify a valid path.");
    }
    else if ((data === null || data === void 0 ? void 0 : data._type) === "image") {
        return React.createElement("img", { className: className, src: data.imgUrl });
    }
    else {
        return React.createElement("div", { className: className }, data);
    }
}
