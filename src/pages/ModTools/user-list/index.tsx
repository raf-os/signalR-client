import GlobalConfig from "@/lib/GlobalConfig";
import AuthHandler from "@/handlers/authHandler";
import { useLoaderData } from "react-router";

import PageLayout from "../components/PageLayout";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function UserListPage() {
    const { success: isValid } = useLoaderData();

    return isValid? (
        <PageLayout
            mainContent={<UserListContent />}
            sideBar={<UserListSidebar />}
        />
    ) : (
        <>Nope</>
    )
}

function UserListSidebar() {
    return (
        <p>
            Aye, this be a sidebar.
        </p>
    )
}

function UserListContent() {
    const { userList } = useLoaderData<TLoader>();
    return (
        <>
            <h1 className="text-lg font-medium">
                Registered users
            </h1>
            <div className="relative w-full overflow-x-auto border border-gray-800 rounded-lg shadow-md">
                <table className="w-full caption-bottom text-sm">
                    <thead>
                        <tr className="bg-gray-800 text-neutral-50 text-base">
                            <TableHead>Username</TableHead>
                            <TableHead className="w-[240px] text-right">Auth level</TableHead>
                        </tr>
                    </thead>
                    <TableBody>
                        { userList?.map((u, idx) => (
                            <UserItem userInfo={u} key={idx} />
                        )) }
                    </TableBody>
                    
                </table>
            </div>
        </>
    )
}

function UserItem({ userInfo }: { userInfo: TUserInfo }) {
    const authMap = ['Guest', 'User', 'Operator', 'Administrator'].at(userInfo.auth) || "N/A";
    return (
        <TableRow className="hover:bg-black/10">
            <TableCell>{ userInfo.name }</TableCell>
            <TableCell className="text-right">{ authMap }</TableCell>
        </TableRow>
    )
}

type TUserInfo = {
    name: string,
    auth: number,
}

type TLoader = {
    success: boolean,
    userList?: TUserInfo[]
}

export async function loader(): Promise<TLoader> {
    const endpoint = GlobalConfig.serverAddr + "api/fetchUserDb";
    const authHandler = new AuthHandler();
    const loginToken = authHandler.fetchLoginToken();

    if (!loginToken) {
        return { success: false }
    }

    try {
        const response = await fetch(
            endpoint,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Auth-Token': loginToken
                }
            }
        );

        if (!response.ok) {
            console.log("Error fetching user list: ", response.status);
        }

        const rBody = await response.json();
        return { success: true, userList: rBody};
    } catch (e) {
        console.log("Error fetching user list: ", e);
        return { success: false }
    }
}