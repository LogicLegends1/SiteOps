// This page is used to handle the redirect from the OAuth provider after a successful login.

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      router.push("/login");
    }
  }, [searchParams, router]);

  return <div>Loading...</div>;
}