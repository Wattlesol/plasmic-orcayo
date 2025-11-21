import React from "react";
export const PlasmicTranslatorContext = React.createContext(undefined);
export function usePlasmicTranslator() {
    const _t = React.useContext(PlasmicTranslatorContext);
    const translator = _t
        ? typeof _t === "function"
            ? _t
            : _t.translator
        : undefined;
    return translator;
}
