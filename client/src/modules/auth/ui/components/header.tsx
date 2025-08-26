import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

interface HeaderProps {
    label: string;
}

export const Header = ({
    label,
}: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center">
            <h1 className={cn(
                "text-3xl font-semibold",
                font.className
            )}>
                {label}
            </h1>
            <p className="text-muted-foreground text-sm">
                By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.
            </p>
        </div>
    )
}