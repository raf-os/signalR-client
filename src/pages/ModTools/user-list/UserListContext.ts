import { createContext } from "react";
import type { TUserInfo } from ".";

export type EditRequestPayload = {
    userId: number,
    userName: string,
    userAuth: number,
}

export type TUserListContext = {
    openEditWindow: (props: TUserInfo) => void,
    submitUserEdit: (payload: EditRequestPayload, callback?: ({ success, message }: { success: boolean, message?: string }) => void) => void,
    isEditPending: boolean,
};

const defaultUserListContext: TUserListContext = {
    openEditWindow: () => {},
    submitUserEdit: () => {},
    isEditPending: false,
};

export const UserListContext = createContext<TUserListContext>(defaultUserListContext);