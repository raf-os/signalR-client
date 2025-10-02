import { type RouteObject } from "react-router";

const ModToolsRoute: RouteObject[] = [{
    index: true,
    lazy: async () => {
        const Component = (await import("@/pages/ModTools/default")).default;
        return { Component };
    },
}, {
    path: "user-list",
    lazy: async () => {
        const module = (await import("@/pages/ModTools/user-list"));
        const Component = module.default;
        const loader = module.loader;
        return { Component, loader };
    }
}];

export default ModToolsRoute;