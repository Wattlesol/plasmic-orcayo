import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { Registerable } from "./reg-util";
import { PopoverExtraProps } from "./util";
export declare function Popover({ open, onOpenChange, defaultOpen, modal, className, sideOffset, themeResetClass, overlay, slideIn, trigger, children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content> & PopoverPrimitive.PopoverProps & PopoverExtraProps & {
    trigger?: boolean;
}): React.JSX.Element;
export declare namespace Popover {
    var displayName: string;
}
export declare function registerPopover(PLASMIC?: Registerable): void;
