import { CodeComponentMeta } from "@plasmicapp/host";
import React from "react";
export declare function ensure<T>(x: T | null | undefined): T;
interface AudioPlayerProps {
    className?: string;
    src?: string;
    autoPlay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
    volume?: number;
}
export declare const AudioPlayerMeta: CodeComponentMeta<AudioPlayerProps>;
export declare function AudioPlayer({ className, src, autoPlay, controls, loop, muted, volume, }: AudioPlayerProps): React.JSX.Element;
export {};
