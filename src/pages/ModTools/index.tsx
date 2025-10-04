// This is probably visible to the client. Server still handles the actual requests.
// It's fine. Probably.

import { useLoaderData, NavLink, Outlet } from "react-router";
import NotAuthorized from "@pages/NotAuthorized";
import { NavBarList, NavBarItem } from "./components/NavBar";
import { Button } from "@/components/ui/button";
import { DashboardContext } from "./DashboardContext";
import { Toaster } from "@/components/ui/sonner";

export default function ModTools(){
    const { isValid, authState } = useLoaderData<{isValid: boolean, authState?: number}>();
    const Comp = isValid ? <Page /> : <NotAuthorized />;
    const ctx = {
        authState: authState || 0,
    };
    return (
        <DashboardContext.Provider value={ctx}>
            { Comp }
            <Toaster />
        </DashboardContext.Provider>
    );
}

function Page() {
    return (
        <div className="dark flex w-full h-dvh bg-zinc-900 text-neutral-50">
            <ModNavBar />

            <div className="flex w-full h-full grow-1 shrink-1 relative">
                <Outlet />
            </div>
        </div>
    )
}

function ModNavBar() {
    return (
        <div className="flex p-4 overflow-hidden grow-0 shrink-0 w-[320px] h-full text-neutral-50">
            <div className="flex flex-col justify-between grow-1 shrink-1 rounded-lg bg-neutral-700/25 border border-neutral-800/75 p-1">
                <div className="flex flex-col p-3">
                    <div className="font-bold text-lg">
                        <NavLink to="/mod">
                            Chat mod tools
                        </NavLink>
                    </div>

                    <NavBarList>
                        <NavBarItem href="user-list">
                            User List
                        </NavBarItem>
                    </NavBarList>
                </div>

                <Button asChild><NavLink to="/">
                    Back to chat
                </NavLink></Button>
            </div>
        </div>
    )
}
