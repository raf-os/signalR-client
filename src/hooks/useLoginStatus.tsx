import AppContext from "@/lib/AppContext";
import { useContext } from "react";

export default function useLoginStatus() {
    const { username } = useContext(AppContext);

    return (username===undefined)? false : true;
}