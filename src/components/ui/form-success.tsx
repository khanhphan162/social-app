import { FaCheckCircle } from "react-icons/fa";

interface FormErrorProps {
    message?: string;
}

export const FormSuccess = ({
    message,
}: FormErrorProps) => {
    if (!message) return null;

    return (
        <div className="bg-blue-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-blue-500">
            <FaCheckCircle className="h-4 w-4" />
            <p>{message}</p>
        </div>
    );
}