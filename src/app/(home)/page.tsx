import CreatePost from "@/modules/home/ui/components/post/create-post";
import { PageClient } from "./client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import HomeContent from "@/modules/home/ui/components/home-content";

export default async function Home() {
  const user = true;

  return (
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error...</p>}>
          <HomeContent/>
        </ErrorBoundary>
      </Suspense>
  );
}
