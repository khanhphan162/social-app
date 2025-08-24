import Image from "next/image"
import Link from "next/link"

import { LoginButton } from "@/modules/auth/ui/components/login-button"
import { SignupButton } from "@/modules/auth/ui/components/signup-button"

import { SearchInput } from "./search-input"

export const HomeNavbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
            <div className="flex items-center gap-4 w-full">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0">
                    <Link href="/">
                        <div className="p-4 flex items-center gap-1">
                            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                            <p className="text-xl font-semibold text-blue-500 tracking-tight">SocialApp</p>
                        </div>
                    </Link>
                </div>
                {/* Search bar */}
                <div className="flex-1 flex justify-center max-w-[720px] mx-auto">
                    <SearchInput />
                </div>

                <div className="flex-shrink-0 items-center gap-4 space-x-2">
                    <LoginButton />
                    <SignupButton />
                </div>
            </div>
        </nav>
    )
}