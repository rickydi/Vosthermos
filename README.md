# Site Web Vosthermos

Site web professionnel pour Vosthermos, spécialiste en réparation de portes et fenêtres.

## Configuration du Formulaire de Contact

Le formulaire de contact utilise PHP pour envoyer les messages directement avec votre adresse email info@vosthermos.com via votre hébergement cPanel.

### Fonctionnement du système

Notre solution utilise un script PHP qui s'exécute directement sur votre serveur d'hébergement et se connecte à votre compte email vosthermos.com :

1. **Utilisation de vos paramètres SMTP cPanel**
   - Les emails sont envoyés directement depuis votre propre serveur mail
   - Les messages apparaissent comme envoyés depuis votre domaine vosthermos.com
   - Aucune limite de messages par mois

2. **Configuration simple**
   - Le script send-email.php est déjà configuré avec les informations de votre serveur mail
   - Les messages sont formatés en HTML pour une présentation professionnelle
   - Redirection automatique vers la page de remerciement après l'envoi

3. **Remarques importantes**
   - Cette solution ne fonctionne que lorsque le site est hébergé sur un serveur web avec PHP
   - Quand vous testez en local (sur votre ordinateur), le formulaire ne pourra pas envoyer de messages
   - Pour faire fonctionner le formulaire, vous devez uploader le site sur votre hébergement web

## Structure du Site

Le site est composé de 6 sections principales accessibles par défilement horizontal :

1. **Accueil** - Présentation générale de l'entreprise
2. **Quincaillerie** - Services de remplacement de quincaillerie
3. **Vitre Thermos** - Remplacement de vitres thermos
4. **Portes en Bois** - Réparation de portes en bois
5. **Moustiquaires** - Fabrication et réparation de moustiquaires
6. **Contact** - Formulaire de contact et informations

## Caractéristiques

- Design responsive adapté à tous les appareils
- Navigation fluide entre les sections
- Galeries d'images avec effet zoom au survol
- Formulaire de contact fonctionnel
- Optimisé pour les performances et le SEO

## Maintenance

Pour mettre à jour le contenu :

1. Textes : Modifiez directement les balises HTML dans `index.html`
2. Images : Remplacez les fichiers dans les dossiers correspondants sous `/images/`
3. Styles : Modifiez `css/styles.css` pour ajuster l'apparence
4. Fonctionnalités : Les scripts se trouvent dans le dossier `js/`
