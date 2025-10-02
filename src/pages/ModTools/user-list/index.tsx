import { useState } from "react";

import GlobalConfig from "@/lib/GlobalConfig";
import AuthHandler from "@/handlers/authHandler";
import { useLoaderData } from "react-router";

import PageLayout from "../components/PageLayout";

import {
    Table,
    TableWrapper,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Button } from "@/components/ui/button";
import { SelectGroup } from "@radix-ui/react-select";

export default function UserListPage() {
    const { success: isValid } = useLoaderData();

    return isValid? (
        <PageLayout
            mainContent={<UserListContent />}
        />
    ) : (
        <>Nope</>
    )
}

function UserListContent() {
    const { userList } = useLoaderData<TLoader>();
    return (
        <>
            <h1 className="text-xl font-medium">
                Registered users
            </h1>
            <p>
                This is a list of all registered users in this service.
            </p>
            <TableWrapper className="outline outline-offset-1 outline-blue-800 rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-blue-800 text-neutral-50 text-base">
                            <TableHead>Username</TableHead>
                            <TableHead className="w-[240px] text-right">Auth level</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-blue-950">
                        { userList?.map((u, idx) => (
                            <UserItem userInfo={u} key={idx} />
                        )) }
                    </TableBody>
                    
                </Table>
            </TableWrapper>
        </>
    )
}

function UserItem({ userInfo }: { userInfo: TUserInfo }) {
    const authMap = ['Guest', 'User', 'Operator', 'Administrator'];
    const authValue = authMap.at(userInfo.auth) || "N/A";
    const [ isEditorOpen, setIsEditorOpen ] = useState<boolean>(false);
    return (
        <>
            <TableRow className="hover:bg-neutral-950/10 cursor-pointer group" onClick={() => setIsEditorOpen(true)} role="button">
                <TableCell>
                    <span
                        className="group-hover:text-orange-300 font-medium"
                        onClick={() => setIsEditorOpen(true)}
                    >
                        { userInfo.name }
                    </span>
                </TableCell>
                <TableCell className="text-right">{ authValue }</TableCell>
            </TableRow>
            <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>
                            Editing user "<span className="text-blue-600">{ userInfo.name }</span>"
                        </SheetTitle>
                        <SheetDescription>
                            Edit details below then click save at the bottom
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-2 px-4">
                        <Label>Username</Label>
                        <Input value={userInfo.name} disabled />

                        <Label>Account level</Label>
                        <Select defaultValue={`${userInfo.auth}`}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    { authMap.map((a, idx) => (
                                        <SelectItem value={`${idx}`} key={idx}>{ a }</SelectItem>
                                    )) }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <SheetFooter>
                        <Button variant="destructive">Cancel</Button>
                        <Button>Save</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
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