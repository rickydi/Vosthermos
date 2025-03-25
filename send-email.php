<?php
// Récupérer les données du formulaire
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$service = $_POST['service'] ?? '';
$message = $_POST['message'] ?? '';

// Vérifier que tous les champs sont remplis
if (empty($name) || empty($email) || empty($phone) || empty($service) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Veuillez remplir tous les champs du formulaire.']);
    exit;
}

// Paramètres de l'email
$to = 'info@vosthermos.com';
$subject = 'Nouvelle demande depuis le site Vosthermos';
$headers = "From: $name <$email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

// Contenu de l'email au format HTML
$email_content = "
<html>
<head>
    <title>Nouvelle demande depuis le site web</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #e30718; }
        .detail { margin-bottom: 10px; }
        .label { font-weight: bold; }
        .message-box { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class='container'>
        <h2>Nouvelle demande de contact</h2>
        <div class='detail'><span class='label'>Nom:</span> $name</div>
        <div class='detail'><span class='label'>Email:</span> $email</div>
        <div class='detail'><span class='label'>Téléphone:</span> $phone</div>
        <div class='detail'><span class='label'>Service demandé:</span> $service</div>
        <div class='message-box'>
            <span class='label'>Message:</span><br>
            " . nl2br(htmlspecialchars($message)) . "
        </div>
    </div>
</body>
</html>
";

// Tentative d'envoi de l'email
$success = mail($to, $subject, $email_content, $headers);

// Réponse en JSON
if ($success) {
    echo json_encode(['success' => true, 'message' => 'Votre message a été envoyé avec succès!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Une erreur est survenue lors de l\'envoi du message.']);
}
?>
