const root = globalThis;
if (root.__PlasmicFunctionsRegistry == null) {
    root.__PlasmicFunctionsRegistry = [];
}
export default function registerFunction(fn, meta) {
    // Check for duplicates
    if (root.__PlasmicFunctionsRegistry.some((r) => r.function === fn &&
        r.meta.name === meta.name &&
        r.meta.namespace == meta.namespace)) {
        return;
    }
    root.__PlasmicFunctionsRegistry.push({ function: fn, meta });
}
