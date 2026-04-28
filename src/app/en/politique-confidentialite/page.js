import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Privacy Policy - Vosthermos",
  description:
    "Vosthermos privacy policy. Learn how we collect, use and protect personal information in accordance with Quebec Law 25.",
  robots: "noindex, nofollow",
  alternates: {
    canonical: "https://www.vosthermos.com/en/politique-confidentialite",
    languages: {
      "fr-CA": "https://www.vosthermos.com/politique-confidentialite",
      "en-CA": "https://www.vosthermos.com/en/politique-confidentialite",
    },
  },
};

const sections = [
  {
    title: "1. Personal information we collect",
    text: "We may collect your name, email address, phone number, mailing address, order details, chat messages, photos you send us, IP address and browsing data when you use our website, online store, forms or chat.",
  },
  {
    title: "2. How we use information",
    text: "We use this information to process orders, answer quote requests, schedule appointments, provide customer service, improve the website, send relevant service communications with your consent and comply with legal obligations.",
  },
  {
    title: "3. Cookies and analytics",
    text: "The site uses cookies for essential functions such as cart, session and chat continuity. We also use Google Analytics to understand site traffic and improve the user experience.",
  },
  {
    title: "4. Secure payments",
    text: "Online payments are processed securely by Stripe. Vosthermos does not store credit card numbers or sensitive banking information on its servers.",
  },
  {
    title: "5. SMS and chat communications",
    text: "We may use SMS and online chat to follow up on requests, appointments, orders or service questions. Standard carrier fees may apply for SMS messages.",
  },
  {
    title: "6. Retention and security",
    text: "Personal information is kept only as long as required for the purpose for which it was collected, legal obligations or service follow-up. We use reasonable safeguards to protect it.",
  },
  {
    title: "7. Your rights",
    text: "Under Quebec Law 25, you may request access, correction, withdrawal of consent or deletion of your personal information, subject to legal retention requirements.",
  },
];

export default function PrivacyPolicyEn() {
  return (
    <main className="bg-[var(--color-background)] pt-[80px]">
      <section className="bg-[var(--color-teal-dark)]">
        <div className="max-w-[1000px] mx-auto px-6 py-16">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/en" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Privacy policy</span>
          </div>
          <span className="section-tag">Legal</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-3">
            Privacy policy
          </h1>
          <p className="text-white/70 mt-4 max-w-2xl">
            How Vosthermos collects, uses and protects personal information.
          </p>
        </div>
      </section>

      <section className="max-w-[1000px] mx-auto px-6 py-14">
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6 md:p-10">
          <p className="text-[var(--color-muted)] mb-8">
            Last updated: April 2026. This English version is provided for convenience.
            The French version remains the reference for Quebec legal wording.
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                <p className="text-[var(--color-muted)] leading-relaxed">{section.text}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
            <h2 className="text-xl font-bold mb-3">Contact</h2>
            <p className="text-[var(--color-muted)] leading-relaxed">
              To exercise your privacy rights or ask a question, contact Vosthermos at{" "}
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-[var(--color-red)] hover:underline">
                {COMPANY_INFO.email}
              </a>{" "}
              or call{" "}
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="text-[var(--color-red)] hover:underline">
                {COMPANY_INFO.phone}
              </a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
