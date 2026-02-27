"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Handles the GitHub Pages SPA redirect trick.
 * When 404.html redirects to the root, this component reads the stored path
 * from sessionStorage and navigates there using the Next.js router.
 */
export function SpaRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const redirect = sessionStorage.getItem("__spa_redirect__");
    if (redirect && redirect !== "/") {
      sessionStorage.removeItem("__spa_redirect__");
      router.replace(redirect);
    }
  }, [router]);

  return null;
}
