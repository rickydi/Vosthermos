import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialite - Vosthermos",
  description:
    "Politique de confidentialite de Vosthermos. Decouvrez comment nous collectons, utilisons et protegeons vos renseignements personnels conformement a la Loi 25 du Quebec.",
  robots: "noindex, nofollow",
};

const sections = [
  {
    id: "collecte",
    icon: "fa-clipboard-list",
    title: "1. Collecte de renseignements personnels",
    content: (
      <>
        <p>
          Dans le cadre de nos activites, nous collectons certains renseignements
          personnels lorsque vous utilisez notre site Web, passez une commande ou
          communiquez avec nous. Les renseignements collectes peuvent inclure :
        </p>
        <ul>
          <li>Nom complet</li>
          <li>Adresse courriel</li>
          <li>Numero de telephone</li>
          <li>Adresse postale (pour la livraison et la facturation)</li>
          <li>Informations relatives a vos commandes et transactions</li>
          <li>Adresse IP et donnees de navigation</li>
        </ul>
        <p>
          Ces renseignements sont recueillis avec votre consentement, soit lors de
          la creation de votre compte, de la passation d&apos;une commande, de
          l&apos;utilisation de notre clavardage en ligne ou de toute autre
          interaction avec nos services.
        </p>
      </>
    ),
  },
  {
    id: "utilisation",
    icon: "fa-bullseye",
    title: "2. Utilisation des renseignements",
    content: (
      <>
        <p>Les renseignements personnels collectes sont utilises aux fins suivantes :</p>
        <ul>
          <li>Traiter et expedier vos commandes</li>
          <li>Communiquer avec vous concernant vos commandes, rendez-vous ou demandes de soumission</li>
          <li>Ameliorer nos services et l&apos;experience utilisateur sur notre site</li>
          <li>Vous envoyer des communications relatives a nos produits et services, avec votre consentement</li>
          <li>Repondre a vos questions via le clavardage en ligne</li>
          <li>Respecter nos obligations legales</li>
        </ul>
        <p>
          Nous ne vendons, n&apos;echangeons ni ne louons vos renseignements
          personnels a des tiers a des fins commerciales.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    icon: "fa-cookie-bite",
    title: "3. Cookies et technologies de suivi",
    content: (
      <>
        <p>Notre site utilise des cookies et des technologies similaires pour :</p>
        <ul>
          <li>Assurer le bon fonctionnement du site (cookies de session)</li>
          <li>Maintenir votre panier d&apos;achats et votre session de clavardage</li>
          <li>Analyser la frequentation et le comportement des visiteurs via Google Analytics (identifiant : G-8NHVJ5P419)</li>
        </ul>
        <p>
          <strong>Google Analytics</strong> collecte des donnees anonymisees sur
          votre utilisation du site, notamment les pages visitees, la duree des
          visites et votre provenance geographique approximative. Ces donnees nous
          aident a ameliorer notre site. Google peut transferer ces informations a
          des tiers lorsque la loi l&apos;exige. Pour en savoir plus, consultez la{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-red)] hover:underline"
          >
            politique de confidentialite de Google
          </a>
          .
        </p>
        <p>
          Vous pouvez desactiver les cookies dans les parametres de votre
          navigateur. Toutefois, certaines fonctionnalites du site pourraient ne
          plus fonctionner correctement.
        </p>
      </>
    ),
  },
  {
    id: "paiement",
    icon: "fa-lock",
    title: "4. Paiement securise",
    content: (
      <>
        <p>
          Les paiements en ligne sur notre site sont traites de maniere securisee
          par <strong>Stripe</strong>, un fournisseur de services de paiement
          certifie PCI DSS de niveau 1. Vos informations de carte de credit sont
          transmises directement a Stripe via une connexion chiffree (TLS/SSL).
        </p>
        <p>
          <strong>
            Vosthermos ne stocke jamais vos numeros de carte de credit
          </strong>{" "}
          ni aucune donnee bancaire sensible sur ses serveurs. Seul un identifiant
          de transaction securise est conserve pour le suivi de votre commande.
        </p>
      </>
    ),
  },
  {
    id: "sms",
    icon: "fa-comment-sms",
    title: "5. Communication par SMS",
    content: (
      <>
        <p>
          Nous utilisons le service <strong>Twilio</strong> pour l&apos;envoi de
          messages textes (SMS) dans les situations suivantes :
        </p>
        <ul>
          <li>Notifications liees au clavardage en ligne</li>
          <li>Confirmations de rendez-vous ou de prise en charge</li>
          <li>Suivi de commande lorsque applicable</li>
        </ul>
        <p>
          Votre numero de telephone est transmis a Twilio uniquement pour
          l&apos;acheminement des messages. Vous pouvez cesser de recevoir des SMS
          en nous contactant directement. Des frais de messagerie standard de votre
          fournisseur peuvent s&apos;appliquer.
        </p>
      </>
    ),
  },
  {
    id: "clavardage",
    icon: "fa-comments",
    title: "6. Conversations par clavardage",
    content: (
      <>
        <p>
          Notre site offre un service de clavardage en ligne (chat) pour vous
          permettre de communiquer directement avec notre equipe. Les donnees
          suivantes sont collectees et conservees :
        </p>
        <ul>
          <li>Le contenu de vos messages textes</li>
          <li>Les photos que vous envoyez via le clavardage</li>
          <li>La date et l&apos;heure de chaque message</li>
          <li>Votre nom et numero de telephone (si fournis)</li>
        </ul>
        <p>
          Ces donnees sont conservees afin de vous offrir un meilleur suivi et
          d&apos;assurer la continuite de nos echanges. Les photos transmises sont
          stockees de maniere securisee sur nos serveurs.
        </p>
      </>
    ),
  },
  {
    id: "conservation",
    icon: "fa-database",
    title: "7. Conservation des donnees",
    content: (
      <>
        <p>
          Vos renseignements personnels sont conserves aussi longtemps que
          necessaire pour les fins pour lesquelles ils ont ete collectes :
        </p>
        <ul>
          <li>
            <strong>Donnees de compte client :</strong> conservees tant que votre
            compte est actif, puis supprimees dans les 12 mois suivant une demande
            de fermeture
          </li>
          <li>
            <strong>Donnees de commande et de facturation :</strong> conservees
            pendant 7 ans conformement aux obligations fiscales du Quebec
          </li>
          <li>
            <strong>Conversations de clavardage :</strong> conservees pendant 24
            mois a compter du dernier echange
          </li>
          <li>
            <strong>Donnees de navigation (analytics) :</strong> conservees pendant
            26 mois selon la configuration de Google Analytics
          </li>
          <li>
            <strong>Cookies de session :</strong> supprimes a la fermeture de votre
            navigateur ou apres un delai d&apos;inactivite
          </li>
        </ul>
        <p>
          A l&apos;expiration de ces delais, les donnees sont supprimees ou
          anonymisees de maniere irreversible.
        </p>
      </>
    ),
  },
  {
    id: "droits",
    icon: "fa-user-shield",
    title: "8. Vos droits en vertu de la Loi 25",
    content: (
      <>
        <p>
          Conformement a la{" "}
          <em>
            Loi modernisant des dispositions legislatives en matiere de protection
            des renseignements personnels
          </em>{" "}
          (Loi 25 du Quebec), vous disposez des droits suivants :
        </p>
        <ul>
          <li>
            <strong>Droit d&apos;acces :</strong> vous pouvez demander une copie
            des renseignements personnels que nous detenons a votre sujet
          </li>
          <li>
            <strong>Droit de rectification :</strong> vous pouvez demander la
            correction de renseignements inexacts ou incomplets
          </li>
          <li>
            <strong>Droit de suppression :</strong> vous pouvez demander la
            suppression de vos renseignements personnels, sous reserve de nos
            obligations legales de conservation
          </li>
          <li>
            <strong>Droit a la portabilite :</strong> vous pouvez demander de
            recevoir vos renseignements dans un format technologique structure et
            couramment utilise
          </li>
          <li>
            <strong>Droit au retrait du consentement :</strong> vous pouvez retirer
            votre consentement a tout moment pour la collecte ou l&apos;utilisation
            de vos renseignements, dans la mesure ou cela n&apos;empeche pas
            l&apos;execution d&apos;un contrat en cours
          </li>
          <li>
            <strong>Droit de desindexation :</strong> vous pouvez demander la
            cessation de la diffusion de renseignements personnels vous concernant
          </li>
        </ul>
        <p>
          Pour exercer l&apos;un de ces droits, veuillez nous contacter par
          courriel a{" "}
          <a
            href="mailto:info@vosthermos.com"
            className="text-[var(--color-red)] hover:underline font-medium"
          >
            info@vosthermos.com
          </a>{" "}
          ou par telephone au{" "}
          <a
            href="tel:15148258411"
            className="text-[var(--color-red)] hover:underline font-medium"
          >
            514-825-8411
          </a>
          . Nous traiterons votre demande dans un delai de 30 jours suivant sa
          reception.
        </p>
        <p>
          Si vous estimez que vos droits n&apos;ont pas ete respectes, vous pouvez
          deposer une plainte aupres de la{" "}
          <a
            href="https://www.cai.gouv.qc.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-red)] hover:underline font-medium"
          >
            Commission d&apos;acces a l&apos;information du Quebec (CAI)
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "securite",
    icon: "fa-shield-halved",
    title: "9. Mesures de securite",
    content: (
      <>
        <p>
          Nous prenons la protection de vos renseignements personnels au serieux et
          mettons en place les mesures suivantes :
        </p>
        <ul>
          <li>
            <strong>Connexion chiffree (HTTPS) :</strong> toutes les communications
            entre votre navigateur et notre site sont chiffrees via le protocole
            TLS/SSL
          </li>
          <li>
            <strong>Mots de passe chiffres :</strong> vos mots de passe sont
            stockes sous forme hachee (bcrypt) et ne sont jamais conserves en clair
          </li>
          <li>
            <strong>Cookies securises :</strong> nos cookies d&apos;authentification
            utilisent les attributs HttpOnly, Secure et SameSite pour prevenir les
            attaques
          </li>
          <li>
            <strong>Acces restreint :</strong> seul le personnel autorise a acces a
            vos renseignements personnels, dans la stricte mesure necessaire a
            l&apos;exercice de leurs fonctions
          </li>
          <li>
            <strong>Hebergement securise :</strong> nos serveurs sont heberges au
            Canada et proteges par des pare-feux et des systemes de detection
            d&apos;intrusion
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "modifications",
    icon: "fa-pen-to-square",
    title: "10. Modifications a cette politique",
    content: (
      <>
        <p>
          Vosthermos se reserve le droit de modifier cette politique de
          confidentialite a tout moment afin de refleter les changements dans nos
          pratiques ou les exigences legales. Toute modification sera publiee sur
          cette page avec la date de mise a jour.
        </p>
        <p>
          Nous vous encourageons a consulter cette page periodiquement. Votre
          utilisation continue du site apres la publication de modifications
          constitue votre acceptation de la politique mise a jour.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    icon: "fa-envelope",
    title: "11. Nous contacter",
    content: (
      <>
        <p>
          Pour toute question concernant cette politique de confidentialite ou pour
          exercer vos droits relatifs a la protection de vos renseignements
          personnels, veuillez communiquer avec le responsable de la protection des
          renseignements personnels :
        </p>
        <div className="bg-[var(--color-background)] rounded-xl p-6 border border-[var(--color-border)] not-in-section">
          <p className="font-bold text-[var(--color-foreground)] text-lg mb-3">
            Vosthermos
          </p>
          <ul className="not-styled space-y-2">
            <li className="flex items-start gap-3">
              <i className="fas fa-map-marker-alt text-[var(--color-red)] mt-1 w-4 text-center"></i>
              <span>330 Ch. St-Francois-Xavier, Local 101, Saint-Francois-Xavier, QC</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-phone text-[var(--color-red)] mt-1 w-4 text-center"></i>
              <a href="tel:15148258411" className="text-[var(--color-red)] hover:underline font-medium">
                514-825-8411
              </a>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-envelope text-[var(--color-red)] mt-1 w-4 text-center"></i>
              <a href="mailto:info@vosthermos.com" className="text-[var(--color-red)] hover:underline font-medium">
                info@vosthermos.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-id-card text-[var(--color-red)] mt-1 w-4 text-center"></i>
              <span>RBQ : 5790-9498-01</span>
            </li>
          </ul>
        </div>
      </>
    ),
  },
];

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      {/* Header */}
      <section className="bg-[var(--color-teal-dark)] pt-[75px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-white">Politique de confidentialite</span>
          </div>
          <span className="section-tag inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <i className="fas fa-shield-halved mr-1"></i> Protection de vos
            donnees
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Politique de confidentialite
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Vosthermos s&apos;engage a proteger vos renseignements personnels
            conformement a la{" "}
            <em>
              Loi modernisant des dispositions legislatives en matiere de
              protection des renseignements personnels
            </em>{" "}
            (Loi 25) du Quebec.
          </p>
        </div>
      </section>

      {/* Date de mise a jour */}
      <section className="bg-[var(--color-background)]">
        <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-2">
          <p className="text-sm text-[var(--color-muted)]">
            <i className="fas fa-calendar-alt mr-2"></i>
            Derniere mise a jour : 26 mars 2026
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-[var(--color-background)] pb-20">
        <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)]"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-teal-dark)] text-white text-sm">
                  <i className={`fas ${section.icon}`}></i>
                </span>
                {section.title}
              </h2>
              <div className="text-[var(--color-muted)] leading-relaxed space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:transition-colors [&_.not-styled]:list-none [&_.not-styled]:pl-0">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
