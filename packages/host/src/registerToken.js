const root = globalThis;
if (root.__PlasmicTokenRegistry == null) {
    root.__PlasmicTokenRegistry = [];
}
export default function registerToken(token) {
    root.__PlasmicTokenRegistry.push(token);
}
