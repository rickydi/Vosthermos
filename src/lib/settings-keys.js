// Cles de site_settings partagees entre le serveur et les composants client.
// Fichier volontairement SANS dependance : importer @/lib/photo-request depuis
// un composant client tirait tout le SDK Twilio dans le bundle navigateur
// (« Module not found: Can't resolve 'dns' / 'fs' / 'net' / 'tls' »).

export const APPEL_AUTO_PHOTO_SMS_KEY = "appel_auto_photo_sms";
