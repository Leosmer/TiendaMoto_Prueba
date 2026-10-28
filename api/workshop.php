<?php
/**
 * ============================================================
 * APEX MOTO — API REST: Citas de Taller (MySQL)
 * ============================================================
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. Obtener citas de taller (Panel Admin)
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `workshop_appointments` ORDER BY `id` DESC");
    $appointments = array_map(function($a) {
        return [
            'id'         => intval($a['id']),
            'name'       => $a['name'],
            'phone'      => $a['phone'],
            'bike'       => $a['bike'],
            'service'    => $a['service'],
            'notes'      => $a['notes'],
            'status'     => $a['status'],
            'created_at' => $a['created_at']
        ];
    }, $stmt->fetchAll());

    sendJSON([
        'success' => true,
        'count'   => count($appointments),
        'data'    => $appointments
    ]);
}

// 2. Guardar nueva cita de taller
if ($method === 'POST') {
    $data = getRequestBody();

    $name    = trim($data['name'] ?? '');
    $phone   = trim($data['phone'] ?? '');
    $bike    = trim($data['bike'] ?? '');
    $service = trim($data['service'] ?? 'Mantenimiento preventivo');
    $notes   = trim($data['notes'] ?? '');

    if (empty($name) || empty($phone) || empty($bike)) {
        sendJSON(['success' => false, 'error' => 'Nombre, teléfono y modelo de moto son obligatorios.'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO `workshop_appointments` (`name`, `phone`, `bike`, `service`, `notes`, `status`) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $phone, $bike, $service, $notes, 'Confirmada']);
    $newId = intval($pdo->lastInsertId());

    sendJSON([
        'success' => true,
        'message' => '¡Cita de taller registrada y guardada exitosamente en la base de datos!',
        'id'      => $newId
    ], 201);
}

sendJSON(['success' => false, 'error' => 'Método no soportado'], 405);
