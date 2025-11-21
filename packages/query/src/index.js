import { mutateKeys } from "./query-data";
export { useSWRConfig } from "swr";
export { addLoadingStateListener, HeadMetadataContext, isPlasmicPrepass, PlasmicPrepassContext, PlasmicQueryDataProvider, useMutablePlasmicQueryData, usePlasmicDataConfig, usePlasmicQueryData, wrapLoadingFetcher, } from "./query-data";
if (typeof window !== "undefined") {
    const root = window;
    const maybeExistingMutateAllKeys = root.__SWRMutateAllKeys;
    root.__SWRMutateAllKeys = (invalidateKey) => {
        mutateKeys(invalidateKey);
        if (typeof maybeExistingMutateAllKeys === "function") {
            maybeExistingMutateAllKeys(invalidateKey);
        }
    };
}
