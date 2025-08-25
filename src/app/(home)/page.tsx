import CreatePost from "@/modules/home/ui/components/home-navbar/create-post";
import { PageClient } from "./client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function Home() {
  const user = true;

  return (
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error...</p>}>
          <div className="grid grid-cols-1">
            <div>
              {user ? <CreatePost /> : null}
            </div>
          </div>
          <PageClient />
        </ErrorBoundary>
      </Suspense>
  );
}
