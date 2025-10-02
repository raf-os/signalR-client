import { NavLink } from "react-router"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export function NavBarList({ children, className, ...rest }: React.ComponentPropsWithRef<'ul'>){
    return (
        <ul
            className={cn(
                "p-2 flex flex-col gap-2",
                className
            )}
            {...rest}
        >
            {children}
        </ul>
    )
}

export function NavBarItem({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <NavLink
                to={`/mod/${href}`}
                className="flex items-center font-medium hover:text-orange-400"
            >
                {({isActive}) => (
                    <>
                        { isActive && <ChevronRight className="grow-0 shrink-0 size-4" />}
                        {children}
                    </>
                )}
            </NavLink>
        </li>
    )
}