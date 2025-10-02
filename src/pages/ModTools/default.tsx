import PageLayout from "./components/PageLayout";

export default function DefaultModPage() {
    return (
        <PageLayout
            mainContent={<DefaultModPageContent />}
        />
    )
}

export function DefaultModPageContent() {
    return (
        <div className="flex flex-col gap-2">
            <p>This is the EXCLUSIVE mod dashboard.</p>
            <p>You've made it into the big leagues, big boy.</p>
            <p>You're now a BIG SHOT.</p>
        </div>
    )
}