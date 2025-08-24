"use client";

import { useRouter } from "next/navigation";

interface AuthButtonProps {
    children: React.ReactNode;
    href: string;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const AuthButton = ({
    children,
    href,
    mode = "redirect",
    asChild
}: AuthButtonProps) => {
    const route = useRouter();

    const onClick = () => {
        route.push(href);
    };

    if (mode === "modal") {
        return (
            <span>
                
            </span>
        )
    }

    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    )
}