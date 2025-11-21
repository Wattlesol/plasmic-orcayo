import registerComponent from "@plasmicapp/host/registerComponent";
import registerGlobalContext from "@plasmicapp/host/registerGlobalContext";
export declare function registerAll(loader?: {
    registerComponent: typeof registerComponent;
    registerGlobalContext: typeof registerGlobalContext;
}): void;
export * from "./contentstack";
