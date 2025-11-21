const root = globalThis;
if (root.__PlasmicContextRegistry == null) {
    root.__PlasmicContextRegistry = [];
}
export default function registerGlobalContext(component, meta) {
    // Check for duplicates
    if (root.__PlasmicContextRegistry.some((r) => r.component === component && r.meta.name === meta.name)) {
        return;
    }
    root.__PlasmicContextRegistry.push({ component, meta });
}
