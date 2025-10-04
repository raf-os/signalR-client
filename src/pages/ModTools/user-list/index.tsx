import { useContext, useState, useTransition, startTransition } from "react";

import { useLoaderData } from "react-router";
import { cn } from "@/lib/utils";
import { requestServerAction } from "../(auth)/actionWrapper";

import PageLayout from "../components/PageLayout";
import { UserListContext, type TUserListContext, type EditRequestPayload } from "./UserListContext";

import {
    Table,
    TableWrapper,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import * as DialogPrimitive from "@radix-ui/react-dialog";

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
import { toast } from "sonner";

import { X as XIcon, ChevronDownIcon } from "lucide-react";
import { DashboardContext } from "../DashboardContext";


export default function UserListPage() {
    const { success: isValid } = useLoaderData();

    return isValid? (
        <PageLayout
            mainContent={<UserListContent />}
        />
    ) : (
        <>Not authorized.</>
    )
}

function UserListContent() {
    const { userList: _userList } = useLoaderData<TLoader>();
    const [ userList, setUserList ] = useState(_userList);
    const [ isEditorOpen, setIsEditorOpen ] = useState<boolean>(false);
    const [ userEditData, setUserEditData ] = useState<TUserInfo | undefined>(undefined);
    const [ isEditRequestPending, startEditRequestTransition ] = useTransition();

    const onEditorWindowOpen: TUserListContext['openEditWindow'] = (props) => {
        if (isEditorOpen) return;
        setIsEditorOpen(true);
        setUserEditData(props);
    }

    const onEditRequestSubmit: TUserListContext['submitUserEdit'] = (payload, callback) => {
        if (isEditRequestPending) return;

        const _payload: EditRequestPayload = {
            userId: Number(payload.userId),
            userName: payload.userName,
            userAuth: Number(payload.userAuth)
        }

        startEditRequestTransition(async () => {
            const result = await requestServerAction("updateUserData", _payload);

            if (result.success) {
                const request = await requestServerAction<TUserInfo[]>("fetchUserDb");

                startTransition(() => {
                    if (request.success) {
                        setUserList(request.content);
                    }
                    callback?.({ success: request.success, message: result.message });
                    setIsEditorOpen(false);
                });
            } else if (callback) {
                callback({ success: false, message: result.message });
            }
        });
    }

    const ctx: TUserListContext = {
        openEditWindow: onEditorWindowOpen,
        submitUserEdit: onEditRequestSubmit,
        isEditPending: isEditRequestPending
    }

    return (
        <UserListContext.Provider value={ctx}>
            <h1 className="text-xl font-medium">
                Registered users
            </h1>
            <p>
                This is a list of all registered users in this service.
            </p>
            <TableWrapper className="outline-1 outline-orange-900 rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-orange-900 text-orange-200 text-base">
                            <TableHead>Username</TableHead>
                            <TableHead className="w-[240px] text-right">Auth level</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-zinc-900">
                        { userList?.map((u, idx) => (
                            <UserItem userInfo={u} key={idx} />
                        )) }
                    </TableBody>
                    
                </Table>
            </TableWrapper>
            <UserEditWindow isOpen={isEditorOpen} setIsOpen={setIsEditorOpen} editData={userEditData} />
        </UserListContext.Provider>
    )
}

function UserItem({ userInfo }: { userInfo: TUserInfo }) {
    const authMap = ['Guest', 'User', 'Operator', 'Administrator'];
    const authValue = authMap.at(userInfo.auth) || "N/A";

    const { openEditWindow } = useContext(UserListContext);

    return (
        <>
            <TableRow className="hover:bg-orange-800/10 cursor-pointer group" onClick={() => openEditWindow(userInfo)} role="button">
                <TableCell>
                    <span
                        className="group-hover:text-orange-300 font-medium"
                    >
                        { userInfo.name }
                    </span>
                </TableCell>
                <TableCell className="text-right">{ authValue }</TableCell>
            </TableRow>
        </>
    )
}

type UserEditWindowProps = {
    isOpen: boolean,
    setIsOpen: (i: boolean) => void,
    editData?: TUserInfo
}

function UserEditWindow({isOpen, setIsOpen, editData}: UserEditWindowProps) {
    if (!editData) return;
    const authMap = ['Guest', 'User', 'Operator', 'Administrator'];
    const authValue = authMap.at(editData.auth) || "N/A";

    const { authState } = useContext(DashboardContext);
    const isHigherAuthority = authState >= editData.auth;
    
    const { submitUserEdit, isEditPending } = useContext(UserListContext);

    const FormItem = ({children, label, ...rest}: React.ComponentPropsWithRef<'div'> & { label?: string }) => {
        return (
            <div className="flex flex-col gap-2" {...rest}>
                { label && <Label>{label}</Label>}
                {children}
            </div>
        )
    }

    const editSubmitCallback = ({ success, message }: { success: boolean, message?: string}) => {
        if (success) { toast.success("User profile saved successfully!"); }
        else if (message) { toast.error(message); }
    }

    const handleSubmit = (formData: FormData) => {
        const userId = formData.get("userId");
        const userName = formData.get("userName");
        const userAuth = formData.get("userAuth");

        if (!userId || !userName || !userAuth) return;

        submitUserEdit({
            userId: Number(userId),
            userName: String(userName),
            userAuth: Number(userAuth)
            },
            editSubmitCallback
        );
    }

    return (
        <DialogPrimitive.Root
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={cn(
                        "bg-black/50 fixed inset-0 z-50",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                    )}
                />
                <DialogPrimitive.Content
                    className={cn(
                        "w-3/4 sm:w-sm h-full flex",
                        "fixed z-50 right-0 top-0 inset-y-0 bg-zinc-800 text-neutral-50",
                        "transition ease-out data-[state=closed]:duration-300 data-[state=open]:duration-300",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
                    )}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <form className="flex flex-col w-full h-full" action={handleSubmit}>
                        <div className="flex flex-col gap-1.5 p-4">
                            <DialogPrimitive.Title
                                className="font-bold text-2xl"
                            >
                                Editing user
                            </DialogPrimitive.Title>

                            <DialogPrimitive.Description
                                className="text-sm opacity-75"
                            >
                                Edit info below and click save when done
                            </DialogPrimitive.Description>
                        </div>

                        
                        <div className="flex flex-col gap-4 p-4">
                            <input type="hidden" name="userId" value={editData.id} />
                            <input type="hidden" name="userName" value={editData.name} />

                            <FormItem label="Username">
                                <Input value={editData.name} disabled />
                            </FormItem>

                            <FormItem label="Auth level">
                                <Select defaultValue={String(editData.auth)} name="userAuth" disabled={!isHigherAuthority}>
                                    <SelectTrigger
                                        className="w-full"
                                        iconRender={(
                                            <ChevronDownIcon className="size-4 text-neutral-50" />
                                        )}
                                    >
                                        <SelectValue placeholder="AUTH" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-700 text-neutral-50">
                                        { authMap.map((a, idx) => (
                                            <SelectItem
                                                key={`authFormLevel::[${idx}]`}
                                                value={String(idx)}
                                                
                                                className="focus:bg-orange-400 focus:text-orange-950"
                                            >
                                                {a}
                                            </SelectItem>
                                        )) }
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        </div>

                        <div className="mt-auto flex flex-col gap-2 p-4">
                            <Button
                                type="submit"
                                disabled={isEditPending}
                            >
                                Save
                            </Button>
                            <DialogPrimitive.Close asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                >
                                    Cancel
                                </Button>
                            </DialogPrimitive.Close>
                        </div>

                        <DialogPrimitive.Close
                            className="absolute border p-[2px] rounded-sm top-4 right-4 opacity-75 hover:opacity-100 transition-opacity focus:outline-hidden"
                        >
                            <XIcon className="size-4" />
                            <span className="sr-only">Close</span>
                        </DialogPrimitive.Close>
                    </form>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}

export type TUserInfo = {
    id: number,
    name: string,
    auth: number,
}

type TLoader = {
    success: boolean,
    userList?: TUserInfo[]
}

export async function loader(): Promise<TLoader> {
    const request = await requestServerAction<TUserInfo[]>("fetchUserDb");
    if (!request.success) {
        console.log("[FETCH ERROR]", request.message);
    }
    return {
        success: request.success,
        userList: request.content
    }
}