import { createContext } from "react";
import type { TUserInfo } from ".";

export type TUserListContext = {
    openEditWindow: (props: TUserInfo) => void,
};

const defaultUserListContext: TUserListContext = {
    openEditWindow: () => {},
};

export const UserListContext = createContext<TUserListContext>(defaultUserListContext);