<?php
/**
 * ============================================================
 * APEX MOTO — API REST: Motocicletas (CRUD de Catálogo)
 * ============================================================
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

function formatMotoRow($row) {
    if (!$row) return null;
    $gallery = [];
    if (!empty($row['gallery'])) {
        $decoded = json_decode($row['gallery'], true);
        $gallery = is_array($decoded) ? $decoded : [$row['image']];
    } else {
        $gallery = [$row['image']];
    }

    return [
        'id'          => intval($row['id']),
        'model'       => $row['model'],
        'brand'       => $row['brand'],
        'type'        => $row['type'],
        'cc'          => intval($row['cc']),
        'hp'          => intval($row['hp']),
        'torque'      => $row['torque'] ?? '110 Nm',
        'weight'      => intval($row['weight'] ?? 185),
        'tank'        => floatval($row['tank'] ?? 16),
        'brakes'      => $row['brakes'] ?? 'Brembo Radial',
        'price'       => floatval($row['price']),
        'condition'   => $row['condition_state'] ?? 'Nuevo',
        'year'        => intval($row['year'] ?? 2026),
        'color'       => $row['color'] ?? 'Edición Especial',
        'image'       => $row['image'],
        'gallery'     => $gallery,
        'description' => $row['description'] ?? '',
        'featured'    => (bool)$row['featured'],
        'created_at'  => $row['created_at'] ?? null,
        'updated_at'  => $row['updated_at'] ?? null,
    ];
}

// ─────────────────────────────────────────────────────────────
// 1. GET: Listar todas o consultar por ID
// ─────────────────────────────────────────────────────────────
if ($method === 'GET') {
    if ($id > 0) {
        $stmt = $pdo->prepare("SELECT * FROM `motorcycles` WHERE `id` = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            sendJSON(['success' => true, 'data' => formatMotoRow($row)]);
        } else {
            sendJSON(['success' => false, 'error' => 'Motocicleta no encontrada'], 404);
        }
    }

    // Listado general con soporte para orden descendente por defecto
    $sql = "SELECT * FROM `motorcycles` ORDER BY `id` DESC";
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();
    $data = array_map('formatMotoRow', $rows);

    sendJSON([
        'success' => true,
        'count'   => count($data),
        'data'    => $data
    ]);
}

// ─────────────────────────────────────────────────────────────
// 2. POST / PUT: Crear, Actualizar o Restablecer
// ─────────────────────────────────────────────────────────────
$data = getRequestBody();

// A. Restablecer catálogo original de fábrica
if ($action === 'reset') {
    $sqlFile = __DIR__ . '/../data/database.sql';
    if (file_exists($sqlFile)) {
        $pdo->exec("TRUNCATE TABLE `motorcycles`");
        // Re-ejecutar inserts
        $sql = file_get_contents($sqlFile);
        // Extraer bloque de INSERT de motocicletas
        if (preg_match('/INSERT INTO `motorcycles`[\s\S]+?;/i', $sql, $matches)) {
            $pdo->exec($matches[0]);
        }
    }

    $stmt = $pdo->query("SELECT * FROM `motorcycles` ORDER BY `id` DESC");
    $items = array_map('formatMotoRow', $stmt->fetchAll());
    sendJSON([
        'success' => true,
        'message' => 'Catálogo restablecido al inventario de fábrica',
        'data'    => $items
    ]);
}

// B. Eliminar Motocicleta (por DELETE o POST action=delete)
if ($method === 'DELETE' || $action === 'delete') {
    $deleteId = $id > 0 ? $id : (intval($data['id'] ?? 0));
    if ($deleteId <= 0) {
        sendJSON(['success' => false, 'error' => 'ID inválido para eliminar'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM `motorcycles` WHERE `id` = ?");
    $stmt->execute([$deleteId]);

    sendJSON([
        'success' => true,
        'message' => "Motocicleta #{$deleteId} eliminada correctamente",
        'id'      => $deleteId
    ]);
}

// C. Actualizar o Crear
$editId = intval($data['id'] ?? ($action === 'update' ? $id : 0));

$model          = trim($data['model'] ?? '');
$brand          = trim($data['brand'] ?? '');
$type           = trim($data['type'] ?? 'Deportiva');
$cc             = intval($data['cc'] ?? 1000);
$hp             = intval($data['hp'] ?? 100);
$torque         = trim($data['torque'] ?? '110 Nm');
$weight         = intval($data['weight'] ?? 185);
$tank           = floatval($data['tank'] ?? 16);
$brakes         = trim($data['brakes'] ?? 'Brembo Radial');
$price          = floatval($data['price'] ?? 0);
$conditionState = trim($data['condition'] ?? ($data['condition_state'] ?? 'Nuevo'));
$year           = intval($data['year'] ?? 2026);
$color          = trim($data['color'] ?? 'Edición Especial');
$image          = trim($data['image'] ?? 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80');
$description    = trim($data['description'] ?? '');
$featured       = !empty($data['featured']) ? 1 : 0;

$gallery = !empty($data['gallery']) ? (is_array($data['gallery']) ? json_encode($data['gallery'], JSON_UNESCAPED_SLASHES) : $data['gallery']) : json_encode([$image], JSON_UNESCAPED_SLASHES);

if (empty($model) || empty($brand) || $price <= 0) {
    sendJSON([
        'success' => false,
        'error'   => 'Faltan campos obligatorios: modelo, marca y precio válido.'
    ], 400);
}

if ($editId > 0) {
    // ACTUALIZAR
    $sql = "UPDATE `motorcycles` SET 
                `model` = ?, `brand` = ?, `type` = ?, `cc` = ?, `hp` = ?, 
                `torque` = ?, `weight` = ?, `tank` = ?, `brakes` = ?, `price` = ?, 
                `condition_state` = ?, `year` = ?, `color` = ?, `image` = ?, 
                `gallery` = ?, `description` = ?, `featured` = ?
            WHERE `id` = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $model, $brand, $type, $cc, $hp, 
        $torque, $weight, $tank, $brakes, $price, 
        $conditionState, $year, $color, $image, 
        $gallery, $description, $featured, $editId
    ]);

    $stmtGet = $pdo->prepare("SELECT * FROM `motorcycles` WHERE `id` = ?");
    $stmtGet->execute([$editId]);
    $updatedRow = $stmtGet->fetch();

    sendJSON([
        'success' => true,
        'message' => "Motocicleta {$brand} {$model} actualizada exitosamente",
        'data'    => formatMotoRow($updatedRow)
    ]);
} else {
    // CREAR NUEVA
    $sql = "INSERT INTO `motorcycles` (
                `model`, `brand`, `type`, `cc`, `hp`, 
                `torque`, `weight`, `tank`, `brakes`, `price`, 
                `condition_state`, `year`, `color`, `image`, 
                `gallery`, `description`, `featured`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $model, $brand, $type, $cc, $hp, 
        $torque, $weight, $tank, $brakes, $price, 
        $conditionState, $year, $color, $image, 
        $gallery, $description, $featured
    ]);

    $newId = intval($pdo->lastInsertId());
    $stmtGet = $pdo->prepare("SELECT * FROM `motorcycles` WHERE `id` = ?");
    $stmtGet->execute([$newId]);
    $newRow = $stmtGet->fetch();

    sendJSON([
        'success' => true,
        'message' => "¡Nueva motocicleta {$brand} {$model} agregada con éxito!",
        'data'    => formatMotoRow($newRow)
    ], 201);
}
