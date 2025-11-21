import React from "react";
import useSWR, { SWRConfig, useSWRConfig, } from "swr";
let __SWRConfig = undefined;
export const mutateKeys = (invalidateKey) => {
    if (__SWRConfig) {
        const { cache, mutate } = __SWRConfig;
        (invalidateKey != null
            ? [invalidateKey]
            : Array.from(cache.keys())).forEach((key) => {
            mutate(key);
        });
    }
};
// @plasmicapp/query is optimized for SSR, so we do not revalidate
// automatically upon hydration; as if the data is immutable.
function getPlasmicDefaultSWROptions(opts) {
    return {
        revalidateIfStale: !!(opts === null || opts === void 0 ? void 0 : opts.isMutable),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    };
}
/**
 * Fetches data asynchronously. This data should be considered immutable for the
 * session -- there is no way to invalidate or re-fetch this data.
 *
 * @param key a unique key for this data fetch; if data already exists under this
 *   key, that data is returned immediately.
 * @param fetcher an async function that resolves to the fetched data.
 * @returns an object with either a "data" key with the fetched data if the fetch
 *   was successful, or an "error" key with the thrown Error if the fetch failed.
 */
export function usePlasmicQueryData(key, fetcher) {
    const prepassCtx = React.useContext(PrepassContext);
    const opts = getPlasmicDefaultSWROptions();
    if (prepassCtx) {
        // If we're doing prepass, then we are always in suspense mode, because
        // react-ssr-prepass only works with suspense-throwing data fetching.
        opts.suspense = true;
    }
    const config = useSWRConfig();
    React.useEffect(() => {
        __SWRConfig = config;
    }, [config]);
    const wrappedFetcher = React.useMemo(() => wrapLoadingFetcher(fetcher), [fetcher]);
    const resp = useSWR(key, wrappedFetcher, opts);
    if (resp.data !== undefined) {
        return { data: resp.data };
    }
    else if (resp.error) {
        return { error: resp.error };
    }
    else {
        return { isLoading: true };
    }
}
/**
 * Fetches data asynchronously using SWR Hook (https://swr.vercel.app/)
 *
 * @param key a unique key for this data fetch; if data already exists under this
 *   key, that data is returned immediately.
 * @param fetcher an async function that resolves to the fetched data.
 * @param options (optional) an object of options for this hook (https://swr.vercel.app/docs/options).
 * @returns an object with either a "data" key with the fetched data if the fetch
 *   was successful, or an "error" key with the thrown Error if the fetch failed.
 */
export function useMutablePlasmicQueryData(key, fetcher, options) {
    const prepassCtx = React.useContext(PrepassContext);
    const opts = {
        ...getPlasmicDefaultSWROptions({ isMutable: true }),
        ...options,
    };
    if (prepassCtx) {
        opts.suspense = true;
    }
    const config = useSWRConfig();
    React.useEffect(() => {
        __SWRConfig = config;
    }, [config]);
    const [isLoading, setIsLoading] = React.useState(false);
    const fetcherWrapper = React.useCallback(async (...args) => {
        setIsLoading(true);
        try {
            return await wrapLoadingFetcher(fetcher)(...args);
        }
        finally {
            setIsLoading(false);
        }
    }, [fetcher]);
    // Based on https://swr.vercel.app/docs/middleware#keep-previous-result
    const laggyDataRef = React.useRef();
    const { isValidating, mutate, data, error } = useSWR(key, fetcherWrapper, opts);
    React.useEffect(() => {
        if (data !== undefined) {
            laggyDataRef.current = data;
        }
    }, [data]);
    return React.useMemo(() => ({
        isValidating,
        mutate,
        isLoading: (data === undefined && error === undefined) || isLoading,
        ...(data !== undefined
            ? { data }
            : error === undefined && laggyDataRef.current
                ? // Show previous data if available
                    { data: laggyDataRef.current, isLagging: true }
                : {}),
        ...(error !== undefined ? { error } : {}),
    }), [isValidating, mutate, data, error, isLoading]);
}
export function PlasmicQueryDataProvider(props) {
    const { children, suspense, prefetchedCache } = props;
    const prepass = React.useContext(PrepassContext);
    if (prepass) {
        // If we're in prepass, then there's already a wrappign SWRConfig;
        // don't interfere with it.
        return React.createElement(React.Fragment, null, children);
    }
    else {
        return (React.createElement(SWRConfig, { value: {
                fallback: prefetchedCache !== null && prefetchedCache !== void 0 ? prefetchedCache : {},
                suspense,
            } }, children));
    }
}
const PrepassContext = React.createContext(false);
export function PlasmicPrepassContext(props) {
    const { cache, children } = props;
    return (React.createElement(PrepassContext.Provider, { value: true },
        React.createElement(SWRConfig, { value: {
                provider: () => cache,
                suspense: true,
                fallback: {},
            } }, children)));
}
export const usePlasmicDataConfig = useSWRConfig;
let loadingCount = 0;
const listeners = [];
/**
 * Subscribes to whether any loading is happening via @plasmicapp/query.
 * Returns a function to unsubscribe.
 */
export function addLoadingStateListener(listener, opts) {
    listeners.push(listener);
    if (opts === null || opts === void 0 ? void 0 : opts.immediate) {
        listener(loadingCount > 0);
    }
    return () => {
        listeners.splice(listeners.indexOf(listener), 1);
    };
}
/**
 * Instruments an async function to increment and decrement the number of
 * simultaneous async loads. You can then subscribe to whether there
 * are any loads happening via addLoadingStateListener().
 */
export function wrapLoadingFetcher(fetcher) {
    return (async (...args) => {
        if (loadingCount === 0) {
            listeners.forEach((listener) => listener(true));
        }
        loadingCount += 1;
        try {
            const res = fetcher(...args);
            return isPromiseLike(res) ? await res : res;
        }
        finally {
            loadingCount -= 1;
            if (loadingCount === 0) {
                listeners.forEach((listener) => listener(false));
            }
        }
    });
}
function isPromiseLike(x) {
    return (!!x && typeof x === "object" && "then" in x && typeof x.then === "function");
}
export function isPlasmicPrepass() {
    var _a, _b, _c;
    return !!((_c = (_b = (_a = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) === null || _a === void 0 ? void 0 : _a.ReactCurrentDispatcher) === null || _b === void 0 ? void 0 : _b.current) === null || _c === void 0 ? void 0 : _c.isPlasmicPrepass);
}
export const HeadMetadataContext = React.createContext({});
