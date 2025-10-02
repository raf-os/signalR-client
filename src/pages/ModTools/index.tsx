// This is probably visible to the client. Server still handles the actual requests.
// It's fine. Probably.

import { useLoaderData, NavLink, Outlet } from "react-router";
import NotAuthorized from "@pages/NotAuthorized";
import { NavBarList, NavBarItem } from "./components/NavBar";

export default function ModTools(){
    const { isValid } = useLoaderData();
    const Comp = isValid ? <Page /> : <NotAuthorized />;
    return Comp;
}

function Page() {
    return (
        <div className="flex w-full h-dvh bg-gray-700 text-neutral-50">
            <ModNavBar />

            <div className="flex w-full h-full grow-1 shrink-1 relative">
                <Outlet />
            </div>
        </div>
    )
}

function ModNavBar() {
    return (
        <div className="flex p-4 flex-col overflow-hidden grow-0 shrink-0 w-[320px] h-full bg-gray-800 text-neutral-50">
            <div className="font-bold text-lg">
                <NavLink to="/mod">
                    Chat mod tools
                </NavLink>
            </div>

            <NavBarList>
                <NavBarItem href="user-list">
                    User List
                </NavBarItem>
                <NavLink to="/">
                    {`<`} Back to chat
                </NavLink>
            </NavBarList>
        </div>
    )
}
