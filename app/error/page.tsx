"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  "401": "Unauthorized",
  "402": "Payment Required",
  "410": "Gone",
  "420": "Enhance Your Calm",
  "404": "Page not found",
  "500": "Internal Server Error",
  "502": "Bad Gateway",
  "504": "Gateway Timeout",
  "default": "Something went wrong",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = errorMessages[error as string] || errorMessages["default"];

  return (
    <div className="not-found-page">
      <h1 className="text-4xl font-bold text-white">{error}</h1>
      <h1 className="text-4xl font-bold text-white">{message}</h1>
      <a
        href="/"
        className="mt-4 text-4xl rounded text-white text-decoration-none px-4 py-2"
        style={{ fontSize: "16px" }}
      >
        Home
      </a>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
