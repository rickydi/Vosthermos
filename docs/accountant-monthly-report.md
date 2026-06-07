# Rapport mensuel comptable

Vosthermos peut generer un rapport mensuel des factures pour le comptable.

## Configuration

Dans l'admin:

1. Aller a `/admin/parametres`.
2. Section `Rapport comptable`.
3. Entrer le courriel du comptable.
4. Optionnel: entrer l'ID du dossier Google Drive.
5. Sauvegarder.

Les valeurs sont stockees dans `site_settings` avec les cles:

```text
accountant_email
drive_report_folder_id
```

## Utilisation

Dans `/admin/factures`, la section `Rapport mensuel comptable` permet de:

- choisir un mois;
- ouvrir le rapport PDF;
- telecharger le CSV;
- envoyer le PDF et le CSV au comptable.

Le mois d'une facture est determine par `invoiceIssuedAt`. Si cette date est absente sur une ancienne facture, le rapport utilise la date du bon de travail comme fallback.

## Courriel

L'envoi utilise le transport courriel existant de Vosthermos:

- Gmail API si elle est configuree;
- SMTP en fallback si Gmail API n'est pas completement configuree et que SMTP existe.

Si `accountant_email` n'est pas configure, les factures existantes continuent de fonctionner normalement. Seul l'envoi du rapport comptable est bloque.

## Google Drive

Si `drive_report_folder_id` est configure, le PDF et le CSV sont aussi televerses
dans ce dossier Drive apres l'envoi courriel.

Le depot Drive est best-effort: si Drive echoue, le courriel au comptable reste
envoye et l'erreur Drive est retournee a l'admin.

Configuration serveur requise:

```text
GOOGLE_DRIVE_SA_KEY_PATH=/chemin/vers/google-drive-service-account.json
```

Alternative possible:

```text
GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON={...json complet...}
```

`GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` peut aussi etre encode en base64.

Etapes Google:

1. Activer Google Drive API dans Google Cloud.
2. Creer ou reutiliser un service account.
3. Mettre sa cle JSON sur le serveur, hors git.
4. Partager le dossier Drive cible avec l'adresse `client_email` du service account en role editeur.
5. Coller l'ID du dossier dans `/admin/parametres`.

Chemins de cle ignores par git:

```text
config/google-drive-service-account*.json
secrets/google-drive-service-account*.json
```

## Routes

```text
GET  /api/admin/factures/report?month=YYYY-MM&format=pdf
GET  /api/admin/factures/report?month=YYYY-MM&format=csv
GET  /api/admin/factures/report?month=YYYY-MM&format=summary
POST /api/admin/factures/report
```

Le `POST` prend:

```json
{ "month": "2026-06" }
```
