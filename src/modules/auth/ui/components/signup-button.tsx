import { UserSearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export const SignupButton = () => {
    return (
        <Button
            variant="outline"
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:text-white
            hover:bg-blue-700 rounded-md shadow-sm"
        >
            Sign up
        </Button>
    )
}