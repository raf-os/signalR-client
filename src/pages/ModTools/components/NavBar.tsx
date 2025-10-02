import { NavLink } from "react-router"

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
            >
                {children}
            </NavLink>
        </li>
    )
}