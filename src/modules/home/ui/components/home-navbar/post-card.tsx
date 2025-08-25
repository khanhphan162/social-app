import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface PostCardProps {
    authorName: string;
    profilePicture: string;
    content: string;
    isEdited: boolean;
    editedBy: string;
    isDeleted: boolean;
    deletedBy: string;
}

export const PostCard = ({
    authorName,
    profilePicture,
    content,
    isEdited,
    editedBy,
    isDeleted,
    deletedBy,
}: PostCardProps) => {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                    <div className="flex space-x-3 sm:space-x-4">
                        
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}