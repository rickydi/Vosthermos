import UploadPhotos from "./UploadPhotos";

export const metadata = {
  title: "Envoyer vos photos | Vosthermos",
  robots: "noindex, nofollow",
};

// Page publique atteinte via le lien texté au client (token signé 7 jours).
// La validation du token se fait côté client via l'API — la page reste statique.
export default async function EnvoyerPhotosPage({ params }) {
  const { token } = await params;
  return <UploadPhotos token={token} />;
}
