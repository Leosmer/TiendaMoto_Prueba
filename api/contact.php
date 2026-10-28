<?php
/**
 * ============================================================
 * APEX MOTO — API REST: Mensajes de Contacto (MySQL)
 * ============================================================
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. Obtener mensajes (Panel Admin)
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `contact_messages` ORDER BY `id` DESC");
    $messages = array_map(function($m) {
        return [
            'id'         => intval($m['id']),
            'name'       => $m['name'],
            'email'      => $m['email'],
            'subject'    => $m['subject'],
            'message'    => $m['message'],
            'created_at' => $m['created_at']
        ];
    }, $stmt->fetchAll());

    sendJSON([
        'success' => true,
        'count'   => count($messages),
        'data'    => $messages
    ]);
}

// 2. Guardar mensaje de formulario
if ($method === 'POST') {
    $data = getRequestBody();

    $name    = trim($data['name'] ?? '');
    $email   = trim($data['email'] ?? '');
    $subject = trim($data['subject'] ?? 'Consulta General');
    $message = trim($data['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        sendJSON(['success' => false, 'error' => 'Nombre, correo y mensaje son obligatorios.'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO `contact_messages` (`name`, `email`, `subject`, `message`) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $subject, $message]);
    $newId = intval($pdo->lastInsertId());

    sendJSON([
        'success' => true,
        'message' => '¡Tu mensaje ha sido recibido y guardado en la base de datos! Te responderemos a la brevedad.',
        'id'      => $newId
    ], 201);
}

sendJSON(['success' => false, 'error' => 'Método no soportado'], 405);
