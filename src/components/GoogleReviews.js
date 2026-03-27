"use client";

import { useState } from "react";

const reviews = [
  {
    author: "Caroline Montpetit",
    rating: 5,
    date: "Il y a 2 semaines",
    text: "Service impeccable pour le remplacement de mes vitres thermos. L'equipe est arrivee a l'heure, travail propre et soigne. Plus de buee dans mes fenetres! Je recommande fortement.",
    city: "Longueuil",
  },
  {
    author: "Marc-Andre Dufresne",
    rating: 5,
    date: "Il y a 1 mois",
    text: "Excellent rapport qualite-prix pour la quincaillerie de ma porte patio. Le technicien a trouve la bonne piece tout de suite. Service professionnel et courtois.",
    city: "Brossard",
  },
  {
    author: "Nathalie Gagnon",
    rating: 5,
    date: "Il y a 1 mois",
    text: "Tres satisfaite de la reparation de ma porte en bois. Travail minutieux, on dirait une porte neuve! L'estimation etait exacte, aucune surprise.",
    city: "Saint-Hyacinthe",
  },
  {
    author: "Robert Lavoie",
    rating: 5,
    date: "Il y a 2 mois",
    text: "Commande de pieces en ligne, livraison rapide. Les roulettes pour ma porte-patio etaient exactement ce qu'il fallait. Boutique en ligne pratique et bien organisee.",
    city: "Chambly",
  },
  {
    author: "Sylvie Tremblay",
    rating: 5,
    date: "Il y a 2 mois",
    text: "Moustiquaire sur mesure livree en quelques jours. Parfaitement ajustee, installation facile. Le prix etait tres raisonnable comparativement aux grandes surfaces.",
    city: "Laval",
  },
  {
    author: "Jean-Francois Bouchard",
    rating: 4,
    date: "Il y a 3 mois",
    text: "Bon service pour le remplacement de 3 thermos. Equipe competente et travail bien fait. Delai un peu plus long que prevu mais resultat impeccable.",
    city: "Montreal",
  },
  {
    author: "Isabelle Morin",
    rating: 5,
    date: "Il y a 3 mois",
    text: "Service apres-vente remarquable. Un petit ajustement etait necessaire apres l'installation et ils sont revenus le lendemain sans frais. Ca c'est du vrai service!",
    city: "Varennes",
  },
  {
    author: "Pierre Leblanc",
    rating: 5,
    date: "Il y a 4 mois",
    text: "Deuxieme fois que je fais affaire avec Vosthermos. Toujours le meme service de qualite. Cette fois-ci pour la quincaillerie complete de mes 4 fenetres. Parfait!",
    city: "Sainte-Julie",
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`fas fa-star text-xs ${i < count ? "text-amber-400" : "text-gray-300"}`}></i>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initials = review.author
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center text-[var(--color-teal)] font-bold text-sm">
          {initials}
        </div>
        <div>
          <strong className="text-sm block">{review.author}</strong>
          <span className="text-xs text-[var(--color-muted)]">{review.city}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Stars count={review.rating} />
        <span className="text-xs text-[var(--color-muted)]">{review.date}</span>
      </div>
      <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[var(--color-border)]">
        <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span className="text-[10px] text-[var(--color-muted)]">Avis Google</span>
      </div>
    </div>
  );
}

export default function GoogleReviews() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? reviews : reviews.slice(0, 6);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="bg-[var(--color-background)] py-20" id="temoignages">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <span className="section-tag">Avis verifies</span>
          <h2 className="text-3xl font-extrabold">
            Ce que nos <span className="text-[var(--color-red)]">clients disent</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="font-bold text-lg">{avgRating}</span>
              <Stars count={5} />
            </div>
            <span className="text-sm text-[var(--color-muted)]">
              Base sur {reviews.length} avis
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map((review) => (
            <ReviewCard key={review.author} review={review} />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          {reviews.length > 6 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-[var(--color-teal)] font-semibold text-sm hover:text-[var(--color-red)] transition-colors"
            >
              Voir tous les avis ({reviews.length}) <i className="fas fa-chevron-down ml-1"></i>
            </button>
          )}
          <a
            href="https://g.page/r/CbC4-Lf0RLscEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] px-6 py-3 rounded-full font-semibold text-sm hover:shadow-md transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Laisser un avis
          </a>
        </div>
      </div>
    </section>
  );
}
