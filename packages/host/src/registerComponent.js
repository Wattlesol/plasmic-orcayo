const root = globalThis;
// A compile-time error will occur if a new field is added to the StateHelper
// interface but not included in the keys array of state helper.
export const stateHelpersKeys = [
    "initFunc",
    "onChangeArgsToValue",
    "onMutate",
];
if (root.__PlasmicComponentRegistry == null) {
    root.__PlasmicComponentRegistry = [];
}
export default function registerComponent(component, meta) {
    // Check for duplicates
    if (root.__PlasmicComponentRegistry.some((r) => r.component === component && r.meta.name === meta.name)) {
        return;
    }
    root.__PlasmicComponentRegistry.push({ component, meta });
}
