<?php
/**
 * ============================================================
 * APEX MOTO — API REST: Solicitudes de Prueba de Manejo (MySQL)
 * ============================================================
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. Obtener solicitudes (Panel Admin)
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `test_drives` ORDER BY `id` DESC");
    $items = array_map(function($t) {
        return [
            'id'             => intval($t['id']),
            'customer_name'  => $t['customer_name'],
            'customer_email' => $t['customer_email'],
            'bike_model'     => $t['bike_model'],
            'bike_brand'     => $t['bike_brand'],
            'status'         => $t['status'],
            'created_at'     => $t['created_at']
        ];
    }, $stmt->fetchAll());

    sendJSON([
        'success' => true,
        'count'   => count($items),
        'data'    => $items
    ]);
}

// 2. Guardar solicitud
if ($method === 'POST') {
    $data = getRequestBody();

    $name  = trim($data['customer_name'] ?? ($data['name'] ?? 'Cliente Registrado'));
    $email = trim($data['customer_email'] ?? ($data['email'] ?? ''));
    $model = trim($data['bike_model'] ?? ($data['model'] ?? ''));
    $brand = trim($data['bike_brand'] ?? ($data['brand'] ?? ''));

    if (empty($model)) {
        sendJSON(['success' => false, 'error' => 'Se requiere el modelo de motocicleta.'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO `test_drives` (`customer_name`, `customer_email`, `bike_model`, `bike_brand`, `status`) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $model, $brand, 'Solicitado']);
    $newId = intval($pdo->lastInsertId());

    sendJSON([
        'success' => true,
        'message' => "¡Solicitud de prueba de manejo para {$brand} {$model} registrada en la base de datos!",
        'id'      => $newId
    ], 201);
}

sendJSON(['success' => false, 'error' => 'Método no soportado'], 405);
