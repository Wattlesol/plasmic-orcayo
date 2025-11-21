import React from "react";
const PlasmicLinkContext = React.createContext(undefined);
export function usePlasmicLinkMaybe() {
    return React.useContext(PlasmicLinkContext);
}
const AnchorLink = React.forwardRef(function AnchorLink(props, ref) {
    return React.createElement("a", { ...props, ref: ref });
});
export function usePlasmicLink() {
    const Link = React.useContext(PlasmicLinkContext);
    if (Link) {
        return Link;
    }
    else {
        return AnchorLink;
    }
}
export function PlasmicLinkProvider(props) {
    const { Link, children } = props;
    return (React.createElement(PlasmicLinkContext.Provider, { value: Link }, children));
}
