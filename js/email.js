// Configuration du formulaire: Netlify Function + WhatsApp + Netlify Forms
document.addEventListener('DOMContentLoaded', function() {
    var submitBtn = document.getElementById('submitButton');
    var formStatus = document.getElementById('formStatus');
    var form = document.getElementById('contactForm');

    if(submitBtn && form && formStatus) {
        submitBtn.addEventListener('click', function() {
            var name = form.querySelector('#name').value;
            var email = form.querySelector('#email').value;
            var phone = form.querySelector('#phone').value;
            var service = form.querySelector('#service').value;
            var message = form.querySelector('#message').value;

            if (!name || !email || !phone || !service) {
                alert('Veuillez remplir tous les champs obligatoires (Nom, Email, Telephone, Service).');
                return;
            }

            // Nettoyer le telephone
            var cleanedPhone = phone.replace(/\D/g, '');
            if (cleanedPhone.length === 10) {
                cleanedPhone = '+1' + cleanedPhone;
            } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('1')) {
                cleanedPhone = '+' + cleanedPhone;
            } else if (!cleanedPhone.startsWith('+')) {
                cleanedPhone = '+1' + cleanedPhone;
            }

            var originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
            formStatus.textContent = '';

            // ===== 1. SAUVEGARDER DANS NETLIFY BLOBS (serveur) =====
            fetch('/.netlify/functions/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: cleanedPhone,
                    service: service,
                    message: message
                })
            }).catch(function(err) {
                console.log('Sauvegarde serveur:', err.message);
            });

            // ===== 2. BACKUP NETLIFY FORMS =====
            var formData = new FormData(form);
            formData.set('phone', cleanedPhone);
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            }).catch(function(err) {
                console.log('Netlify Forms:', err.message);
            });

            // ===== 3. WHATSAPP =====
            var msg = '*Nouvelle demande vosthermos*\n\n*Nom:* ' + name + '\n*Email:* ' + email + '\n*Telephone:* ' + cleanedPhone + '\n*Service:* ' + service + '\n\n*Message:*\n' + message;
            var encoded = encodeURIComponent(msg);

            fetch('https://api.callmebot.com/whatsapp.php?phone=15145695583&text=' + encoded + '&apikey=9107923')
                .catch(function(e) { console.log('WhatsApp 1:', e.message); });
            fetch('https://api.callmebot.com/whatsapp.php?phone=15148258411&text=' + encoded + '&apikey=1752086')
                .catch(function(e) { console.log('WhatsApp 2:', e.message); });

            // ===== SUCCES =====
            submitBtn.textContent = 'Envoye avec succes!';
            submitBtn.style.backgroundColor = 'rgba(102, 169, 130, 0.5)';
            formStatus.textContent = 'Votre message a ete envoye. Nous vous contacterons bientot.';
            formStatus.style.color = '#66a982';
            form.reset();

            setTimeout(function() {
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = '';
                submitBtn.disabled = false;
                formStatus.textContent = '';
            }, 5000);
        });
    }
});
