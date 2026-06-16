import { Suspense } from "react";
import SubscribeSuccessClient from "./success-client";

export default function SubscribeSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-stone-600">
          Verifying your subscription...
        </main>
      }
    >
      <SubscribeSuccessClient />
    </Suspense>
  );
}
