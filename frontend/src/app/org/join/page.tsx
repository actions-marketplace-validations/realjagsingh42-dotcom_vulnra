import { Suspense } from "react";
import OrgJoinPage from "@/components/org/OrgJoinPage";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Accept Invitation — VULNRA",
};

function JoinFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 animate-spin text-acid" />
    </div>
  );
}

export default function OrgJoinRoute() {
  return (
    <Suspense fallback={<JoinFallback />}>
      <OrgJoinPage />
    </Suspense>
  );
}
