"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter({ company }) {
  const pathname = usePathname();
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/terrain") ||
    pathname.startsWith("/gestionnaire")
  ) return null;
  return <Footer company={company} />;
}
