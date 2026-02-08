<?php
/**
 * API de soumissions Vosthermos
 * Stocke les soumissions dans data/submissions.json
 * Methodes: GET, POST, PATCH, DELETE
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/../data/submissions.json';

// Creer le fichier s'il n'existe pas
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

// Lire les donnees
function readData($file) {
    $content = file_get_contents($file);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

// Ecrire les donnees
function writeData($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Verifier l'authentification pour GET, PATCH, DELETE (pas POST)
function checkAuth() {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    // Simple token - le dashboard envoie le mot de passe en header
    return $token === 'Bearer yesum';
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - Lire toutes les soumissions (protege)
if ($method === 'GET') {
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(['error' => 'Non autorise']);
        exit;
    }
    $data = readData($dataFile);
    echo json_encode($data);
    exit;
}

// POST - Ajouter une soumission (public - depuis le formulaire)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['name']) || empty($input['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Donnees manquantes']);
        exit;
    }

    $data = readData($dataFile);

    $submission = [
        'id' => (string)round(microtime(true) * 1000),
        'name' => htmlspecialchars($input['name'] ?? '', ENT_QUOTES, 'UTF-8'),
        'email' => htmlspecialchars($input['email'] ?? '', ENT_QUOTES, 'UTF-8'),
        'phone' => htmlspecialchars($input['phone'] ?? '', ENT_QUOTES, 'UTF-8'),
        'service' => htmlspecialchars($input['service'] ?? '', ENT_QUOTES, 'UTF-8'),
        'message' => htmlspecialchars($input['message'] ?? '', ENT_QUOTES, 'UTF-8'),
        'date' => date('c'),
        'status' => 'new'
    ];

    // Ajouter au debut du tableau
    array_unshift($data, $submission);

    // Garder max 500 soumissions
    if (count($data) > 500) {
        $data = array_slice($data, 0, 500);
    }

    writeData($dataFile, $data);
    echo json_encode(['success' => true]);
    exit;
}

// PATCH - Changer le statut (protege)
if ($method === 'PATCH') {
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(['error' => 'Non autorise']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['id']) || empty($input['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Donnees manquantes']);
        exit;
    }

    $data = readData($dataFile);
    $found = false;

    foreach ($data as &$item) {
        if ($item['id'] === $input['id']) {
            $item['status'] = htmlspecialchars($input['status'], ENT_QUOTES, 'UTF-8');
            $found = true;
            break;
        }
    }
    unset($item);

    if ($found) {
        writeData($dataFile, $data);
    }

    echo json_encode(['success' => true]);
    exit;
}

// DELETE - Supprimer une soumission (protege)
if ($method === 'DELETE') {
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(['error' => 'Non autorise']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID manquant']);
        exit;
    }

    $data = readData($dataFile);
    $data = array_values(array_filter($data, function($item) use ($input) {
        return $item['id'] !== $input['id'];
    }));

    writeData($dataFile, $data);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Methode non autorisee']);
