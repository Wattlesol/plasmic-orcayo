import { ComponentMeta, GlobalContextMeta } from "@plasmicapp/host";
import React, { ReactNode } from "react";
export declare function ensure<T>(x: T | null | undefined): T;
interface ContentStackCredentialsProviderProps {
    apiKey: string;
    accessToken: string;
    environment: string;
}
export declare const ContentStackCredentialsProviderMeta: GlobalContextMeta<ContentStackCredentialsProviderProps>;
export declare function ContentStackCredentialsProvider({ apiKey, accessToken, environment, children, }: React.PropsWithChildren<ContentStackCredentialsProviderProps>): React.JSX.Element;
interface ContentStackFetcherProps {
    contentType: string;
    children?: ReactNode;
    className?: string;
    noLayout?: boolean;
    filterField?: string;
    queryOperator?: string;
    filterValue?: string | number;
    limit?: number;
    noAutoRepeat?: boolean;
    setControlContextData?: (data: {
        types?: {
            title: string;
            uid: string;
        }[];
        filterFields?: string[];
        queryOptions?: [];
    }) => void;
}
export declare const ContentStackFetcherMeta: ComponentMeta<ContentStackFetcherProps>;
export declare function ContentStackFetcher({ contentType, filterField, filterValue, queryOperator, limit, noAutoRepeat, children, className, noLayout, setControlContextData, }: ContentStackFetcherProps): React.JSX.Element;
interface ContentStackFieldProps {
    className?: string;
    objectPath?: (string | number)[];
    setControlContextData?: (data: {
        data: Record<string, any>;
    }) => void;
}
export declare const ContentStackFieldMeta: ComponentMeta<ContentStackFieldProps>;
export declare function ContentStackField({ objectPath, setControlContextData, ...rest }: ContentStackFieldProps): React.JSX.Element;
export {};
