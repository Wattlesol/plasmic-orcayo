const root = globalThis;
root.__PlasmicFetcherRegistry = [];
export function registerFetcher(fetcher, meta) {
    root.__PlasmicFetcherRegistry.push({ fetcher, meta });
}
