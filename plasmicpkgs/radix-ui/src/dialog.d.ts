import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Registerable } from "./reg-util";
import { AnimatedProps } from "./util";
export declare const DialogClose: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogCloseProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export declare const DialogContent: React.ForwardRefExoticComponent<{
    themeResetClass?: string | undefined;
} & Omit<DialogPrimitive.DialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & AnimatedProps & React.RefAttributes<HTMLDivElement>>;
export declare const SheetContent: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & AnimatedProps & {
    themeResetClass?: string | undefined;
} & VariantProps<(props?: ({
    side?: "left" | "right" | "top" | "bottom" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string> & React.RefAttributes<HTMLDivElement>>;
export declare const sheetVariants: (props?: ({
    side?: "left" | "right" | "top" | "bottom" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const Dialog: React.ForwardRefExoticComponent<DialogPrimitive.DialogProps & DialogPrimitive.DialogOverlayProps & {
    overlayClassName?: string | undefined;
    themeResetClass?: string | undefined;
    noContain?: boolean | undefined;
    triggerSlot?: React.ReactNode;
} & React.RefAttributes<never>>;
export declare const DialogTitle: React.ForwardRefExoticComponent<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>>;
export declare const DialogDescription: React.ForwardRefExoticComponent<DialogPrimitive.DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
export declare function registerDialog(PLASMIC?: Registerable): void;
