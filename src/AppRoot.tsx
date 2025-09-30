// Basic routing

import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router";

const routeObject: RouteObject[] = [{
    path: "/",
    lazy: async () => {
        const Component = (await import("@/pages/index")).default;
        return { Component }
    }
}, {
    path: "/mod",
    lazy: async () => {
        const Component = (await import("@pages/ModTools")).default;
        return { Component }
    }
}];

const router = createBrowserRouter(routeObject);

export default function AppRoot(){
    return <RouterProvider router={router} />
}