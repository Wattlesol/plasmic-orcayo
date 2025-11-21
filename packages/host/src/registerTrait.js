const root = globalThis;
if (root.__PlasmicTraitRegistry == null) {
    root.__PlasmicTraitRegistry = [];
}
export default function registerTrait(trait, meta) {
    root.__PlasmicTraitRegistry.push({
        trait,
        meta,
    });
}
