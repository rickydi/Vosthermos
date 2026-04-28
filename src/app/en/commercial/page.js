import { redirect } from "next/navigation";

export default function CommercialEnRedirect() {
  redirect("/en/contact?subject=commercial");
}
