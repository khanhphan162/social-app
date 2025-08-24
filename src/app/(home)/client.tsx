"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const PageClient = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.hello.queryOptions({
        text: "World",
    }));
    
    return (
        <div>
            Page client says: {data.greeting}
        </div>
    )
}