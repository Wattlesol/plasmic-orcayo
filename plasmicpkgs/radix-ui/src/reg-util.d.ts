import React from "react";
import { ComponentMeta, default as registerComponent } from "@plasmicapp/host/registerComponent";
import { default as registerGlobalContext, GlobalContextMeta } from "@plasmicapp/host/registerGlobalContext";
export type Registerable = {
    registerComponent: typeof registerComponent;
    registerGlobalContext: typeof registerGlobalContext;
};
export declare function makeRegisterComponent<T extends React.ComponentType<any>>(component: T, meta: ComponentMeta<React.ComponentProps<T>>): (loader?: Registerable) => void;
export declare function makeRegisterGlobalContext<T extends React.ComponentType<any>>(component: T, meta: GlobalContextMeta<React.ComponentProps<T>>): (loader?: Registerable) => void;
export declare function registerComponentHelper<T extends React.ComponentType<any>>(loader: Registerable | undefined, component: T, meta: ComponentMeta<React.ComponentProps<T>>): void;
