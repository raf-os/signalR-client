// Basic routing

import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router";
import { AuthState } from "@/hooks/useAuth";
import validateToken from "@/pages/ModTools/(auth)/validateToken";

import ModToolsRoute from "@/pages/ModTools/route";

const routeObject: RouteObject[] = [{
    path: "/",
    lazy: async () => {
        const Component = (await import("@/pages/index")).default;
        return { Component }
    }
}, {
    path: "/mod",
    lazy: async () => {
        const Component = (await import("@/pages/ModTools")).default;
        return { Component };
    },
    loader: async () => {
        const isValid = await validateToken(AuthState.Operator);
        return { isValid: isValid };
    },
    children: ModToolsRoute
}];

const router = createBrowserRouter(routeObject);

export default function AppRoot(){
    return <RouterProvider router={router} />
}