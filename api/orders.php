<?php
/**
 * ============================================================
 * APEX MOTO — API REST: Órdenes y Compras / Reservas (MySQL)
 * ============================================================
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. Obtener todas las órdenes (Panel Administrativo)
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `orders` ORDER BY `id` DESC");
    $orders = array_map(function($o) {
        $items = json_decode($o['items_json'], true);
        return [
            'id'             => intval($o['id']),
            'order_code'     => $o['order_code'],
            'customer_name'  => $o['customer_name'],
            'customer_email' => $o['customer_email'],
            'customer_phone' => $o['customer_phone'],
            'delivery_mode'  => $o['delivery_mode'],
            'payment_method' => $o['payment_method'],
            'items'          => is_array($items) ? $items : [],
            'total_amount'   => floatval($o['total_amount']),
            'status'         => $o['status'],
            'created_at'     => $o['created_at']
        ];
    }, $stmt->fetchAll());

    sendJSON([
        'success' => true,
        'count'   => count($orders),
        'data'    => $orders
    ]);
}

// 2. Registrar nueva orden / compra / reserva
if ($method === 'POST') {
    $data = getRequestBody();

    $name = trim($data['customer_name'] ?? ($data['name'] ?? ''));
    $email = trim($data['customer_email'] ?? ($data['email'] ?? ''));
    $phone = trim($data['customer_phone'] ?? ($data['phone'] ?? ''));
    $delivery = trim($data['delivery_mode'] ?? ($data['delivery'] ?? 'pickup'));
    $payment = trim($data['payment_method'] ?? ($data['payment'] ?? 'card'));
    $total = floatval($data['total_amount'] ?? ($data['total'] ?? 0));
    $orderCode = trim($data['order_code'] ?? ('APX-' . rand(10000, 99999)));

    $items = $data['items'] ?? [];
    $itemsJson = is_array($items) ? json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : strval($items);

    if (empty($name) || empty($email)) {
        sendJSON(['success' => false, 'error' => 'Nombre y correo son requeridos para procesar la orden.'], 400);
    }

    $sql = "INSERT INTO `orders` (
                `order_code`, `customer_name`, `customer_email`, `customer_phone`, 
                `delivery_mode`, `payment_method`, `items_json`, `total_amount`, `status`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $orderCode, $name, $email, $phone, 
        $delivery, $payment, $itemsJson, $total, 'Confirmado'
    ]);

    $newId = intval($pdo->lastInsertId());

    sendJSON([
        'success'    => true,
        'message'    => "¡Orden {$orderCode} registrada y confirmada en la base de datos!",
        'order_id'   => $newId,
        'order_code' => $orderCode,
        'total'      => $total
    ], 201);
}

sendJSON(['success' => false, 'error' => 'Método no soportado'], 405);
