import registerComponent from "@plasmicapp/host/registerComponent";
import registerGlobalContext from "@plasmicapp/host/registerGlobalContext";
import { SanityCredentialsProvider, sanityCredentialsProviderMeta, SanityFetcher, sanityFetcherMeta, SanityField, sanityFieldMeta, } from "./sanity";
export function registerAll(loader) {
    const _registerComponent = (Component, defaultMeta) => {
        if (loader) {
            loader.registerComponent(Component, defaultMeta);
        }
        else {
            registerComponent(Component, defaultMeta);
        }
    };
    if (loader) {
        loader.registerGlobalContext(SanityCredentialsProvider, sanityCredentialsProviderMeta);
    }
    else {
        registerGlobalContext(SanityCredentialsProvider, sanityCredentialsProviderMeta);
    }
    _registerComponent(SanityFetcher, sanityFetcherMeta);
    _registerComponent(SanityField, sanityFieldMeta);
}
export * from "./sanity";
