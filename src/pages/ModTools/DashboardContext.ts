import { createContext } from "react";

export type TDashboardContext = {
    authState: number,
}
export const DashboardContext = createContext<TDashboardContext>({ authState: 0 });