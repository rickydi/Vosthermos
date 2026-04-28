import { redirect } from "next/navigation";

export default function CoproprieteEnRedirect() {
  redirect("/en/contact?subject=condos");
}
