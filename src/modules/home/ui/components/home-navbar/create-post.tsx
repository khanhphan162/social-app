"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, SendIcon } from "lucide-react";
import { useState } from "react";

const CreatePost = () => {
    //const {user} = useUser();
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setIsPosting(true);

        try {

        } catch (error) {

        } finally {
            setIsPosting(false);
        }
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <Textarea
                            placeholder="What's on your mind?"
                            className="min-h-[100px] resize-none border-none focus-visible:ring-0 text-base"
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isPosting}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                        <Button
                            className="flex items-center bg-blue-500 hover:bg-blue-600"
                            onClick={handleSubmit}
                            disabled={(!content.trim()) || isPosting}
                        >
                            {isPosting ? (
                                <>
                                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <SendIcon className="size-4 mr-2" />
                                    Post
                                </>
                            )}
                        </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default CreatePost;