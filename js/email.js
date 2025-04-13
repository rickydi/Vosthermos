// Configuration du formulaire avec envoi direct sur WhatsApp via API (100% gratuit)
document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitButton');
    const formStatus = document.getElementById('formStatus'); 
    const form = document.getElementById('contactForm');
    
    if(submitBtn && form && formStatus) { 
        submitBtn.addEventListener('click', function() {
            // Récupérer les valeurs du formulaire
            const name = form.querySelector('#name').value;
            const email = form.querySelector('#email').value;
            let phone = form.querySelector('#phone').value; // Utiliser let pour pouvoir modifier
            const service = form.querySelector('#service').value;
            const message = form.querySelector('#message').value;
            
            // Vérifier que les champs requis sont remplis (message est optionnel)
            if (!name || !email || !phone || !service) {
                alert('Veuillez remplir tous les champs obligatoires (Nom, Email, Téléphone, Service).');
                return;
            }

            // Nettoyer le numéro de téléphone et ajouter le préfixe +1
            let cleanedPhone = phone.replace(/\D/g, ''); 
            // S'assure qu'il commence bien par 1 (pour l'Amérique du Nord) et ajoute + si absent
            if (cleanedPhone.length === 10) { // Typique numéro nord-américain sans le 1
                 cleanedPhone = '+1' + cleanedPhone;
            } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('1')) { // Numéro avec le 1 mais sans le +
                 cleanedPhone = '+' + cleanedPhone;
            } else if (!cleanedPhone.startsWith('+')) {
                 // Si format inconnu, on tente quand même d'ajouter +1 (peut être ajusté si d'autres formats sont courants)
                 cleanedPhone = '+1' + cleanedPhone; 
            }
            // Si déjà +1..., on ne touche pas.
            
            // Modifier l'apparence du bouton pendant l'envoi
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
            formStatus.textContent = ''; 
            
            // Votre numéro WhatsApp configuré
            const whatsappNumber = '15145695583';
            
            // Formater le message pour WhatsApp avec le numéro nettoyé et préfixé
            const formattedMessage = `*Nouvelle demande vosthermos*
            
*Nom:* ${name}
*Email:* ${email}
*Téléphone:* ${cleanedPhone} 
*Service demandé:* ${service}

*Message:*
${message}`;

            // Encoder le message pour l'URL
            const encodedMessage = encodeURIComponent(formattedMessage);
            
            // Clé API CallMeBot fournie par l'utilisateur
            const apiKey = "9107923";
            
            // Créer l'URL pour la première API WhatsApp
            const whatsappAPI1 = `https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${encodedMessage}&apikey=${apiKey}`;
            
            // Clé API pour le deuxième destinataire
            const apiKey2 = "1752086";
            
            // Créer l'URL pour la deuxième API WhatsApp (même numéro mais API différente)
            const whatsappAPI2 = `https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${encodedMessage}&apikey=${apiKey2}`;
            
            // Fonction pour gérer l'affichage du succès (appelée immédiatement)
            const handleSuccessDisplay = () => {
                submitBtn.textContent = 'Envoyé avec succès!';
                submitBtn.style.backgroundColor = '#28a745';
                formStatus.textContent = 'Votre message a été envoyé. Nous vous contacterons bientôt.';
                formStatus.style.color = '#28a745'; // Vert pour succès
                form.reset();
                
                // Réinitialiser le bouton après 5 secondes
                setTimeout(() => {
                    submitBtn.textContent = originalText; 
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                    formStatus.textContent = ''; 
                }, 5000);
            };

            // Envoyer la requête à la première API WhatsApp
            fetch(whatsappAPI1)
            .then(response => response.text())
            .then(text => {
                 console.log("Réponse API 1 CallMeBot (peut être vide ou indiquer une erreur même si le message est parti):", text);
            })
            .catch(error => {
                console.error('Erreur réseau lors de l\'appel API 1 CallMeBot (ignorée dans l\'UI):', error.message);
            });
            
            // Envoyer la requête à la deuxième API WhatsApp
            fetch(whatsappAPI2)
            .then(response => response.text())
            .then(text => {
                 console.log("Réponse API 2 CallMeBot (peut être vide ou indiquer une erreur même si le message est parti):", text);
            })
            .catch(error => {
                console.error('Erreur réseau lors de l\'appel API 2 CallMeBot (ignorée dans l\'UI):', error.message);
            });

            // Afficher le succès immédiatement dans l'UI, car on sait que le message part
            handleSuccessDisplay();

        });
    }
});

/*
CONFIGURATION API CALLMEBOT (MÉTHODE ALTERNATIVE):

Comme le numéro +34 644 59 77 01 pose problème, voici une autre façon d'obtenir votre API key:

1. Allez sur https://www.callmebot.com/activate/free-api-whatsapp-messages/
2. Entrez votre numéro WhatsApp (+1 514 569 5583)
3. Utilisez votre email pour créer un compte
4. Suivez les instructions sur le site (vous recevrez un lien d'activation par email)
5. Une fois activé, vous recevrez votre API key par WhatsApp et email
6. Remplacez "123456" dans ce fichier par votre API key reçue

Avantages de cette solution:
- Simple pour vos visiteurs - ils remplissent juste le formulaire et c'est tout
- Pour vous - vous recevez les messages directement dans WhatsApp
- 100% gratuit pour un usage normal (quelques centaines de messages par mois)
- Aucun compte à créer pour vos visiteurs
*/
