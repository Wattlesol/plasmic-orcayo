import * as React from "react";
import * as ReactDOM from "react-dom";
import { ensure } from "./lang-utils";
import useForceUpdate from "./useForceUpdate";
if (globalThis.__PlasmicHostVersion == null) {
    globalThis.__PlasmicHostVersion = "3";
}
const rootChangeListeners = [];
class PlasmicRootNodeWrapper {
    constructor(value) {
        this.value = value;
        this.set = (val) => {
            this.value = val;
            rootChangeListeners.forEach((f) => f());
        };
        this.get = () => this.value;
    }
}
const plasmicRootNode = new PlasmicRootNodeWrapper(null);
function getHashParams() {
    return new URLSearchParams(location.hash.replace(/^#/, "?"));
}
function getPlasmicOrigin() {
    const params = getHashParams();
    return ensure(params.get("origin"), "Missing information from Plasmic window.");
}
function getStudioHash() {
    const hashParams = getHashParams();
    if (hashParams.has("studioHash")) {
        return hashParams.get("studioHash");
    }
    const urlParams = new URL(location.href).searchParams;
    return urlParams.get("studio-hash");
}
function renderStudioIntoIframe() {
    const script = document.createElement("script");
    const plasmicOrigin = getPlasmicOrigin();
    const hash = getStudioHash();
    script.src = `${plasmicOrigin}/static/js/studio${hash ? `.${hash}.js` : `.js`}`;
    document.body.appendChild(script);
}
let renderCount = 0;
export function setPlasmicRootNode(node) {
    // Keep track of renderCount, which we use as key to ErrorBoundary, so
    // we can reset the error on each render
    renderCount++;
    plasmicRootNode.set(node);
}
/**
 * React context to detect whether the component is rendered on Plasmic editor.
 * If not, return false.
 * If so, return an object with more information about the component
 */
export const PlasmicCanvasContext = React.createContext(false);
export const usePlasmicCanvasContext = () => React.useContext(PlasmicCanvasContext);
function _PlasmicCanvasHost() {
    var _a, _b;
    // If window.parent is null, then this is a window whose containing iframe
    // has been detached from the DOM (for the top window, window.parent === window).
    // In that case, we shouldn't do anything.  If window.parent is null, by the way,
    // location.hash will also be null.
    const isFrameAttached = !!window.parent;
    const isCanvas = !!((_a = location.hash) === null || _a === void 0 ? void 0 : _a.match(/\bcanvas=true\b/));
    const isLive = !!((_b = location.hash) === null || _b === void 0 ? void 0 : _b.match(/\blive=true\b/)) || !isFrameAttached;
    const shouldRenderStudio = isFrameAttached &&
        !document.querySelector("#plasmic-studio-tag") &&
        !isCanvas &&
        !isLive;
    const forceUpdate = useForceUpdate();
    React.useLayoutEffect(() => {
        rootChangeListeners.push(forceUpdate);
        return () => {
            const index = rootChangeListeners.indexOf(forceUpdate);
            if (index >= 0) {
                rootChangeListeners.splice(index, 1);
            }
        };
    }, [forceUpdate]);
    React.useEffect(() => {
        if (shouldRenderStudio && isFrameAttached && window.parent !== window) {
            renderStudioIntoIframe();
        }
    }, [shouldRenderStudio, isFrameAttached]);
    React.useEffect(() => {
        if (!shouldRenderStudio && !document.querySelector("#getlibs") && isLive) {
            const scriptElt = document.createElement("script");
            scriptElt.id = "getlibs";
            scriptElt.src = getPlasmicOrigin() + "/static/js/getlibs.js";
            scriptElt.async = false;
            scriptElt.onload = () => {
                var _a, _b;
                (_b = (_a = window).__GetlibsReadyResolver) === null || _b === void 0 ? void 0 : _b.call(_a);
            };
            document.head.append(scriptElt);
        }
    }, [shouldRenderStudio]);
    const [canvasContextValue, setCanvasContextValue] = React.useState(() => deriveCanvasContextValue());
    React.useEffect(() => {
        if (isCanvas) {
            const listener = () => {
                setCanvasContextValue(deriveCanvasContextValue());
            };
            window.addEventListener("hashchange", listener);
            return () => window.removeEventListener("hashchange", listener);
        }
        return undefined;
    }, [isCanvas]);
    if (!isFrameAttached) {
        return null;
    }
    if (isCanvas || isLive) {
        let appDiv = document.querySelector("#plasmic-app.__wab_user-body");
        if (!appDiv) {
            appDiv = document.createElement("div");
            appDiv.id = "plasmic-app";
            appDiv.classList.add("__wab_user-body");
            document.body.prepend(appDiv);
        }
        return ReactDOM.createPortal(React.createElement(ErrorBoundary, { key: `${renderCount}` },
            React.createElement(PlasmicCanvasContext.Provider, { value: canvasContextValue }, plasmicRootNode.get())), appDiv, "plasmic-app");
    }
    if (shouldRenderStudio && window.parent === window) {
        return (React.createElement("iframe", { src: `https://docs.plasmic.app/app-content/app-host-ready#appHostUrl=${encodeURIComponent(location.href)}`, style: {
                width: "100vw",
                height: "100vh",
                border: "none",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 99999999,
            } }));
    }
    return null;
}
export const PlasmicCanvasHost = (props) => {
    const { enableWebpackHmr } = props;
    const [node, setNode] = React.useState(null);
    React.useEffect(() => {
        setNode(React.createElement(_PlasmicCanvasHost, null));
    }, []);
    return (React.createElement(React.Fragment, null,
        !enableWebpackHmr && React.createElement(DisableWebpackHmr, null),
        node));
};
const renderErrorListeners = [];
export function registerRenderErrorListener(listener) {
    renderErrorListeners.push(listener);
    return () => {
        const index = renderErrorListeners.indexOf(listener);
        if (index >= 0) {
            renderErrorListeners.splice(index, 1);
        }
    };
}
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error) {
        renderErrorListeners.forEach((listener) => listener(error));
    }
    render() {
        if (this.state.error) {
            return React.createElement("div", null,
                "Error: ",
                `${this.state.error.message}`);
        }
        else {
            return React.createElement(React.Fragment, null, this.props.children);
        }
    }
}
function DisableWebpackHmr() {
    if (process.env.NODE_ENV === "production") {
        return null;
    }
    return (React.createElement("script", { type: "text/javascript", dangerouslySetInnerHTML: {
            __html: `
      if (typeof window !== "undefined") {
        const RealEventSource = window.EventSource;
        window.EventSource = function(url, config) {
          if (/[^a-zA-Z]hmr($|[^a-zA-Z])/.test(url)) {
            console.warn("Plasmic: disabled EventSource request for", url);
            return {
              onerror() {}, onmessage() {}, onopen() {}, close() {}
            };
          } else {
            return new RealEventSource(url, config);
          }
        }
      }
      `,
        } }));
}
function deriveCanvasContextValue() {
    var _a;
    const hash = window.location.hash;
    if (hash && hash.length > 0) {
        // create URLsearchParams skipping the initial # character
        const params = new URLSearchParams(hash.substring(1));
        if (params.get("canvas") === "true") {
            const globalVariants = params.get("globalVariants");
            return {
                componentName: (_a = params.get("componentName")) !== null && _a !== void 0 ? _a : null,
                globalVariants: globalVariants ? JSON.parse(globalVariants) : {},
                interactive: params.get("interactive") === "true",
            };
        }
    }
    return false;
}
const INTERNAL_CC_CANVAS_SELECTION_PROP = "__plasmic_selection_prop__";
export function usePlasmicCanvasComponentInfo(props) {
    return React.useMemo(() => {
        // Inside Plasmic Studio, code components will receive an additional prop
        // that contains selection information for that specific code component.
        // This hook will return that selection information which is useful for
        // changing the behavior of the code component when it is selected, making
        // it easier to interact with code components and slots that aren't always
        // visible in the canvas. (e.g. automatically opening a modal when it's selected)
        const selectionInfo = props === null || props === void 0 ? void 0 : props[INTERNAL_CC_CANVAS_SELECTION_PROP];
        if (selectionInfo) {
            return {
                isSelected: selectionInfo.isSelected,
                selectedSlotName: selectionInfo.selectedSlotName,
            };
        }
        return null;
    }, [props]);
}
