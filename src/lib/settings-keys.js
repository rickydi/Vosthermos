// Cles de site_settings partagees entre le serveur et les composants client.
// Fichier volontairement SANS dependance : importer @/lib/photo-request depuis
// un composant client tirait tout le SDK Twilio dans le bundle navigateur
// (« Module not found: Can't resolve 'dns' / 'fs' / 'net' / 'tls' »).

export const APPEL_AUTO_PHOTO_SMS_KEY = "appel_auto_photo_sms";

// Reglages de l'app mobile « Appels ». Ils vivent en base et sont relus par les
// telephones a chaque appel : changer le delai ou couper l'automatisme ne
// demande PAS de redistribuer l'APK.
export const APP_CALL_ENABLED_KEY = "app_call_enabled";           // "1" / "0"
export const APP_CALL_DELAY_KEY = "app_call_delay_seconds";       // defaut 10
export const APP_CALL_IGNORED_KEY = "app_call_ignored_numbers";   // numeros separes par des virgules

export const APP_CALL_DEFAULTS = {
  enabled: true,
  delaySeconds: 10,
  ignoredNumbers: [],
};
