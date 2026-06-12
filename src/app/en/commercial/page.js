import { permanentRedirect } from "next/navigation";

export default function CommercialEnRedirect() {
  permanentRedirect("/en/contact?subject=commercial");
}
