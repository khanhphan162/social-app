import { UserSearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export const LoginButton = () => {
    return (
        <Button
            variant="outline"
            className="px-4 py-2 text-sm font-medium bg-white text-blue-600 hover:text-blue-600 hover:bg-blue-50 rounded-md shadow-sm"
        >
            Log in
        </Button>
    )
}