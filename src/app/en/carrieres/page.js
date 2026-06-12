import { permanentRedirect } from "next/navigation";

export default function CarrieresEnRedirect() {
  permanentRedirect("/en/contact?subject=careers");
}
