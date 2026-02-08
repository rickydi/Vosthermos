// Configuration du formulaire: WhatsApp + Netlify Forms + localStorage
document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitButton');
    const formStatus = document.getElementById('formStatus');
    const form = document.getElementById('contactForm');

    if(submitBtn && form && formStatus) {
        submitBtn.addEventListener('click', function() {
            const name = form.querySelector('#name').value;
            const email = form.querySelector('#email').value;
            let phone = form.querySelector('#phone').value;
            const service = form.querySelector('#service').value;
            const message = form.querySelector('#message').value;

            if (!name || !email || !phone || !service) {
                alert('Veuillez remplir tous les champs obligatoires (Nom, Email, Telephone, Service).');
                return;
            }

            // Nettoyer le telephone
            let cleanedPhone = phone.replace(/\D/g, '');
            if (cleanedPhone.length === 10) {
                cleanedPhone = '+1' + cleanedPhone;
            } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('1')) {
                cleanedPhone = '+' + cleanedPhone;
            } else if (!cleanedPhone.startsWith('+')) {
                cleanedPhone = '+1' + cleanedPhone;
            }

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
            formStatus.textContent = '';

            // ===== 1. SAUVEGARDER DANS LOCALSTORAGE =====
            var submissions = [];
            try {
                submissions = JSON.parse(localStorage.getItem('vosthermosSubmissions') || '[]');
            } catch(e) {
                submissions = [];
            }
            submissions.unshift({
                id: Date.now(),
                name: name,
                email: email,
                phone: cleanedPhone,
                service: service,
                message: message,
                date: new Date().toISOString(),
                status: 'new'
            });
            // Garder max 200 soumissions
            if (submissions.length > 200) submissions = submissions.slice(0, 200);
            localStorage.setItem('vosthermosSubmissions', JSON.stringify(submissions));

            // ===== 2. ENVOYER A NETLIFY FORMS =====
            var formData = new FormData(form);
            formData.set('phone', cleanedPhone);
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            }).catch(function(err) {
                console.log('Netlify Forms (backup):', err.message);
            });

            // ===== 3. ENVOYER SUR WHATSAPP =====
            const formattedMessage = '*Nouvelle demande vosthermos*\n\n*Nom:* ' + name + '\n*Email:* ' + email + '\n*Telephone:* ' + cleanedPhone + '\n*Service:* ' + service + '\n\n*Message:*\n' + message;
            const encodedMessage = encodeURIComponent(formattedMessage);

            fetch('https://api.callmebot.com/whatsapp.php?phone=15145695583&text=' + encodedMessage + '&apikey=9107923')
                .catch(function(e) { console.log('WhatsApp 1:', e.message); });

            fetch('https://api.callmebot.com/whatsapp.php?phone=15148258411&text=' + encodedMessage + '&apikey=1752086')
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
