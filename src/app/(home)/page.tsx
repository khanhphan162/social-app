import CreatePost from "@/modules/home/ui/components/home-navbar/create-post";
import { getQueryClient, trpc } from "@/trpc/server";
import { PageClient } from "./client";

export default async function Home() {
  const user = true;
  const queryClient = getQueryClient();
  const data = await queryClient.prefetchQuery(
    trpc.hello.queryOptions({text: "World"}),
  );

  return (
    <>
    <div className="grid grid-cols-1">
      <div>
        <PageClient/>
        {user ? <CreatePost /> : null}
      </div>
    </div>
    </>
  );
}
