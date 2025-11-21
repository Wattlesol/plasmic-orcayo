"use client";

import { PLASMIC } from "@/plasmic-init";
import { registerWithDevMeta } from "@/plasmic-register-dev-meta";
import { PlasmicRootProvider, type NextJsPlasmicComponentLoader } from "@plasmicapp/loader-nextjs";
import { registerAll as registerCommerce } from "@plasmicpkgs/commerce";
import { registerAll as registerShopify } from "@plasmicpkgs/commerce-shopify";
import { registerFetch } from "@plasmicpkgs/fetch";
import { registerGraphQL } from "@plasmicpkgs/graphql";
import { registerAll as registerCms } from "@plasmicpkgs/plasmic-cms";
import { registerAll as registerStrapiComponents } from "@plasmicpkgs/plasmic-strapi";
import { registerStrapi } from "@plasmicpkgs/strapi";
import React from "react";

// Create specific compatible loader interfaces for each package type
function makeFunctionLoader(loader: NextJsPlasmicComponentLoader) {
  return {
    registerFunction: (fn: any, meta: any) => {
      // Remove importPath from meta if it exists to make it compatible
      // with the loader-react version that uses Omit<CustomFunctionMeta, "importPath">
      const { importPath: _, ...compatibleMeta } = meta;
      (loader as any).registerFunction(fn, compatibleMeta);
    }
  };
}

function makeComponentLoader(loader: NextJsPlasmicComponentLoader) {
  return {
    registerComponent: (component: any, meta: any) => {
      // Remove importPath from meta if it exists to make it compatible
      const { importPath: _, ...compatibleMeta } = meta;
      (loader as any).registerComponent(component, compatibleMeta);
    }
 };
}

function makeComponentAndContextLoader(loader: NextJsPlasmicComponentLoader) {
  return {
    registerComponent: (component: any, meta: any) => {
      // Remove importPath from meta if it exists to make it compatible
      const { importPath: _, ...compatibleMeta } = meta;
      (loader as any).registerComponent(component, compatibleMeta);
    },
    registerGlobalContext: (context: any, meta: any) => {
      // Remove importPath from meta if it exists to make it compatible
      const { importPath: _, ...compatibleMeta } = meta;
      (loader as any).registerGlobalContext(context, compatibleMeta);
    }
 };
}

function register() {
  registerFetch(makeFunctionLoader(PLASMIC));
  registerGraphQL(makeFunctionLoader(PLASMIC));
  registerCms(makeComponentAndContextLoader(PLASMIC));
  registerStrapi(makeFunctionLoader(PLASMIC));
  registerStrapiComponents(makeComponentAndContextLoader(PLASMIC));
  registerCommerce(makeComponentLoader(PLASMIC));
  registerShopify(makeComponentAndContextLoader(PLASMIC));
}

const useDevNames = true; // set true to avoid conflicting with production hostless names
if (useDevNames) {
  registerWithDevMeta(PLASMIC, register);
} else {
  register();
}

/**
 * PlasmicClientRootProvider is a Client Component that passes in the loader for you.
 *
 * Why? Props passed from Server to Client Components must be serializable.
 * https://beta.nextjs.org/docs/rendering/server-and-client-components#passing-props-from-server-to-client-components-serialization
 * However, PlasmicRootProvider requires a loader, but the loader is NOT serializable.
 *
 * In a Server Component like app/<your-path>/path.tsx, rendering the following would not work:
 *
 * ```tsx
 * import { PLASMIC } from "@/plasmic-init";
 * import { PlasmicRootProvider } from "plasmicapp/loader-nextjs";
 * export default function MyPage() {
 *   const prefetchedData = await PLASMIC.fetchComponentData("YourPage");
 *   return (
 *     <PlasmicRootProvider
 *       loader={PLASMIC} // ERROR: loader is not serializable
 *       prefetchedData={prefetchedData}
 *     >
 *       {yourContent()}
 *     </PlasmicRootProvider>;
 *   );
 * }
 * ```
 *
 * Therefore, we define PlasmicClientRootProvider as a Client Component (this file is marked "use client").
 * PlasmicClientRootProvider wraps the PlasmicRootProvider and passes in the loader for you,
 * while allowing your Server Component to pass in prefetched data and other serializable props:
 *
 * ```tsx
 * import { PLASMIC } from "@/plasmic-init";
 * import { PlasmicClientRootProvider } from "@/plasmic-init-client"; // changed
 * export default function MyPage() {
 *   const prefetchedData = await PLASMIC.fetchComponentData("YourPage");
 *   return (
 *     <PlasmicClientRootProvider // don't pass in loader
 *       prefetchedData={prefetchedData}
 *     >
 *       {yourContent()}
 *     </PlasmicClientRootProvider>;
 *   );
 * }
 * ```
 */
export function PlasmicClientRootProvider(
  props: Omit<React.ComponentProps<typeof PlasmicRootProvider>, "loader">,
) {
  return (
    <PlasmicRootProvider loader={PLASMIC} {...props}></PlasmicRootProvider>
  );
}

