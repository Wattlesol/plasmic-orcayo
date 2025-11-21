import { ComponentMeta, GlobalContextMeta } from "@plasmicapp/host";
import React, { ReactNode } from "react";
export declare function ensure<T>(x: T | null | undefined): T;
interface SanityCredentialsProviderProps {
    projectId?: string;
    dataset?: string;
    apiVersion?: string;
    token?: string;
    useCdn?: boolean;
}
export declare const sanityCredentialsProviderMeta: GlobalContextMeta<SanityCredentialsProviderProps>;
export declare function SanityCredentialsProvider({ projectId, dataset, apiVersion, token, useCdn, children, }: React.PropsWithChildren<SanityCredentialsProviderProps>): React.JSX.Element;
interface SanityFetcherProps {
    groq?: string;
    docType: string;
    filterField?: string;
    filterValue?: string;
    filterParameter?: string;
    noAutoRepeat?: boolean;
    limit?: string;
    children?: ReactNode;
    className?: string;
    noLayout?: boolean;
    setControlContextData?: (data: {
        docTypes?: string[];
        sanityFields?: string[];
        queryOptions?: [];
    }) => void;
}
export declare const sanityFetcherMeta: ComponentMeta<SanityFetcherProps>;
export declare function SanityFetcher({ groq, docType, filterField, filterValue, filterParameter, limit, noAutoRepeat, children, className, noLayout, setControlContextData, }: SanityFetcherProps): React.JSX.Element;
interface SanityFieldProps {
    className?: string;
    path?: string;
    field?: string;
    setControlContextData?: (data: {
        fields: string[];
        isImage: boolean;
    }) => void;
}
export declare const sanityFieldMeta: ComponentMeta<SanityFieldProps>;
export declare function SanityField({ className, path, field, setControlContextData, }: SanityFieldProps): React.JSX.Element;
export {};
