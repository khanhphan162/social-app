import { ErrorBoundary } from "react-error-boundary";
import HomeContent from "@/modules/home/ui/components/home-content";

export default async function Home() {
  return (
    <ErrorBoundary fallback={<p>Error...</p>}>
      <HomeContent />
    </ErrorBoundary>
  );
}
