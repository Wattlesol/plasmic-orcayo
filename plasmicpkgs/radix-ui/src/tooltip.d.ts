import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { Registerable } from "./reg-util";
export declare const Tooltip: React.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & TooltipPrimitive.TooltipProps & import("./util").AnimatedProps & {
    themeResetClass?: string | undefined;
    overlay?: React.ReactNode;
    slideIn?: boolean | undefined;
} & React.RefAttributes<HTMLDivElement>>;
export declare function registerTooltip(PLASMIC?: Registerable): void;
