import Image from "next/image"
import Link from "next/link"

import { AuthButton } from "@/modules/auth/ui/components/auth-button"

import { SearchInput } from "./search-input"
import { Button } from "@/components/ui/button"

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
                    <AuthButton href="/register">
                        <Button
                            variant="outline"
                            className="px-4 py-2 text-sm font-medium
                            bg-blue-500 text-white hover:text-white hover:bg-blue-600 rounded-md shadow-sm">
                                Register
                        </Button>
                    </AuthButton>
                    <AuthButton href="/login">
                        <Button
                            variant="outline"
                            className="px-4 py-2 text-sm font-medium bg-white text-blue-600 hover:text-blue-600 hover:bg-blue-50 rounded-md shadow-sm">
                                Log In
                        </Button>
                    </AuthButton>
                </div>
            </div>
        </nav>
    )
}