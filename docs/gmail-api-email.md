# Envoi courriel via Gmail API

Objectif: envoyer les courriels applicatifs depuis la boite Google Workspace
`info@vosthermos.com`, avec les messages visibles dans Gmail > Envoyes.

Le code garde le fallback SMTP existant. Gmail API est utilise seulement si le
transport est explicitement active et que les variables Gmail sont completes.
Sinon, si `SMTP_HOST` existe, l'envoi continue par le SMTP WHC actuel.

## Variables communes

```env
GMAIL_API_ENABLED="true"
MAIL_TRANSPORT="gmail-api"
GMAIL_API_USER="info@vosthermos.com"
GMAIL_API_FROM="info@vosthermos.com"
GMAIL_API_REPLY_TO="info@vosthermos.com"
```

`GMAIL_API_FROM` et `GMAIL_API_REPLY_TO` sont optionnels. Sans `GMAIL_API_FROM`,
le code utilise `GMAIL_API_USER`, puis les variables SMTP existantes.

## Option A - Google Workspace service account

Recommande pour un serveur de production si l'administrateur Workspace peut
autoriser la delegation de domaine.

```env
GMAIL_API_SERVICE_ACCOUNT_EMAIL="vosthermos-mailer@PROJECT_ID.iam.gserviceaccount.com"
GMAIL_API_PRIVATE_KEY_BASE64="base64_de_la_private_key_du_json"
```

Alternatives acceptees:

```env
GMAIL_API_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GMAIL_API_SERVICE_ACCOUNT_FILE="config/gmail-service-account.json"
```

Etapes Google:

1. Google Cloud Console: creer ou choisir un projet, puis activer Gmail API.
2. Creer un service account dedie, activer la delegation de domaine, puis copier
   son OAuth 2 Client ID dans les parametres avances du service account.
3. Google Admin Console: Security > Access and data control > API controls >
   Manage Domain Wide Delegation > Add new.
4. Ajouter le Client ID du service account avec le scope exact:

```text
https://www.googleapis.com/auth/gmail.send
```

5. Mettre les variables ci-dessus sur le serveur et redemarrer l'app.

## Option B - OAuth2 utilisateur

Utiliser cette option si on prefere autoriser uniquement le compte
`info@vosthermos.com` par consentement OAuth, sans delegation de domaine.

```env
GMAIL_API_CLIENT_ID="..."
GMAIL_API_CLIENT_SECRET="..."
GMAIL_API_REFRESH_TOKEN="..."
GMAIL_API_USER="info@vosthermos.com"
```

Le refresh token doit etre cree avec le compte `info@vosthermos.com` et le scope:

```text
https://www.googleapis.com/auth/gmail.send
```

## SMTP fallback

Garder les variables SMTP actuelles pendant la transition:

```env
SMTP_HOST="..."
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="info@vosthermos.com"
SMTP_REPLY_TO="info@vosthermos.com"
SMTP_ENVELOPE_FROM="..."
```

Comportement:

- Gmail API desactive: SMTP continue comme avant.
- Gmail API active mais variables incompletes: fallback SMTP si `SMTP_HOST`
  existe, avec un warning serveur.
- Gmail API active et complete: envoi par Gmail API. Si les credentials Google
  sont invalides, l'erreur remonte au flow concerne au lieu de masquer le probleme
  par SMTP.

## Flows couverts

- Code de securite admin 2FA.
- Liens de connexion portail gestionnaire.
- Envoi de bon de travail, soumission et facture avec PDF.
- Facture payee.
- Notification admin d'une demande d'intervention portail.
- Emails boutique/blogue qui utilisent deja `getTransporter().sendMail(...)`.

## Verification

Apres configuration:

1. Demander un nouveau code admin ou envoyer un lien de test gestionnaire.
2. Confirmer que le destinataire recoit le courriel.
3. Ouvrir Gmail `info@vosthermos.com` > Envoyes et confirmer que le message est
   present.
4. Garder SMTP configure jusqu'a une verification reussie en production.
