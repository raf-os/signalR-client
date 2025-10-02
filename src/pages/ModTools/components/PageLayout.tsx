import { cn } from "@/lib/utils"

export type PageLayoutProps = {
    mainContent: React.ReactNode,
    sideBar?: React.ReactNode
}

export default function PageLayout({ mainContent, sideBar }: PageLayoutProps) {
    return (
        <>
            <MainContentLayout>
                { mainContent }
            </MainContentLayout>
            <SideBar>
                { sideBar }
            </SideBar>
        </>
    )
}

export function MainContentLayout({ children, className, ...rest }: React.ComponentPropsWithRef<'div'>) {
    return (
        <div
            className={cn(
                "flex w-full h-full grow-1 shrink-1 justify-center p-4",
                className
            )}
            data-slot="main-content-wrapper"
            {...rest}
        >
            <div
                className="flex flex-col w-4xl gap-4"
                data-slot="main-content"
            >
                {children}
            </div>
        </div>
    )
}

export function SideBar({ children, className, ...rest }: React.ComponentPropsWithRef<'div'>) {
    return (
        <div
            className={cn(
                "flex flex-col grow-0 shrink-0 w-[320px] px-2 py-6 sticky",
                className
            )}
            data-slot="side-bar-wrapper"
            {...rest}
        >
            { children }
        </div>
    )
}