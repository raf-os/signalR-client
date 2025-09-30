import * as ScrollArea from "@radix-ui/react-scroll-area";

import AppContext from "@/lib/AppContext";
import { useContext, useState, useEffect } from "react";

//import { faker } from "@faker-js/faker";

type TUserInfo = {
    id: string,
    name: string
}

// const fakeUserList: TUserInfo[] = [...Array(25).keys()].map((i) => {
//     return {
//         id: `FAKER(${i})`,
//         name: faker.internet.username()
//     }
// });

export default function ChatUserList() {
    const [ loggedUsers, setLoggedUsers ] = useState<TUserInfo[]>([]);
    const { signalHandler, isConnected } = useContext(AppContext);

    const onUserListUpdate = (newList: TUserInfo[]) => {
        setLoggedUsers(newList);
    }

    useEffect(() => {
        if (!signalHandler) return;

        signalHandler.observable.on('onUserListUpdate', onUserListUpdate);
        return () => {
            signalHandler.observable.off('onUserListUpdate', onUserListUpdate);
        }
    }, [signalHandler]);

    return (
        <div className="flex flex-col w-[240px] grow-0 shrink-0 border rounded-lg overflow-hidden shadow-md">
            <div className="p-2 text-sm font-bold border-b">
                Active users
            </div>
            <ScrollArea.Root
                className="w-full overflow-hidden"
            >
                <ScrollArea.Viewport
                    className="p-2 size-full"
                >
                    <div className="flex flex-col">
                        { isConnected
                            ? loggedUsers.map(user => <LoggedUser {...user} key={user.id} />)
                            : <p className="text-sm">No server connection.</p>
                        }
                    </div>
                    <ScrollArea.Scrollbar className="flex w-[8px] p-px">
                        <ScrollArea.Thumb className="flex-1 bg-border rounded-full" />
                    </ScrollArea.Scrollbar>
                </ScrollArea.Viewport>
            </ScrollArea.Root>
        </div>
    )
}

function LoggedUser(props: TUserInfo) {
    return (
        <div>
            <div className="text-xs text-neutral-400">
                ID:[{ props.id }]
            </div>
            <div>
                { props.name }
            </div>
        </div>
    )
}