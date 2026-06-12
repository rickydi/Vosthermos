import { permanentRedirect } from "next/navigation";

export default function CoproprieteEnRedirect() {
  permanentRedirect("/en/contact?subject=condos");
}
