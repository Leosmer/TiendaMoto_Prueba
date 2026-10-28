<?php
/**
 * ============================================================
 * APEX MOTO — API REST: Autenticación y Usuarios (MySQL)
 * ============================================================
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$data = getRequestBody();

// 1. Iniciar Sesión (Login)
if ($action === 'login' || ($method === 'POST' && isset($data['email']) && isset($data['password']) && !isset($data['name']))) {
    $email = strtolower(trim($data['email'] ?? ''));
    $password = trim($data['password'] ?? '');

    if (empty($email) || empty($password)) {
        sendJSON(['success' => false, 'error' => 'Correo y contraseña requeridos.'], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM `users` WHERE LOWER(`email`) = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJSON(['success' => false, 'error' => 'Usuario no encontrado o credenciales incorrectas.'], 401);
    }

    // Verificar contraseña (soporta texto directo o hash bcrypt/md5)
    $valid = false;
    if ($user['password'] === $password) {
        $valid = true;
    } elseif (password_verify($password, $user['password'])) {
        $valid = true;
    } elseif (md5($password) === $user['password']) {
        $valid = true;
    }

    if (!$valid) {
        sendJSON(['success' => false, 'error' => 'Contraseña incorrecta.'], 401);
    }

    sendJSON([
        'success' => true,
        'message' => "¡Bienvenido, {$user['name']}!",
        'user' => [
            'id'    => intval($user['id']),
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role']
        ]
    ]);
}

// 2. Registro de Usuario (Register)
if ($action === 'register' || ($method === 'POST' && isset($data['name']))) {
    $name = trim($data['name'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));
    $password = trim($data['password'] ?? '');
    $role = in_array($data['role'] ?? '', ['admin', 'user']) ? $data['role'] : 'user';

    if (empty($name) || empty($email) || empty($password)) {
        sendJSON(['success' => false, 'error' => 'Todos los campos son obligatorios.'], 400);
    }

    // Comprobar si ya existe
    $stmt = $pdo->prepare("SELECT `id` FROM `users` WHERE LOWER(`email`) = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendJSON(['success' => false, 'error' => 'Ese correo electrónico ya se encuentra registrado.'], 409);
    }

    $stmt = $pdo->prepare("INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password, $role]);
    $newId = intval($pdo->lastInsertId());

    sendJSON([
        'success' => true,
        'message' => "Cuenta creada exitosamente. ¡Bienvenido, {$name}!",
        'user' => [
            'id'    => $newId,
            'name'  => $name,
            'email' => $email,
            'role'  => $role
        ]
    ], 201);
}

// 3. Listar usuarios (para vista de administración)
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT `id`, `name`, `email`, `role`, `created_at` FROM `users` ORDER BY `id` ASC");
    $users = array_map(function($u) {
        return [
            'id'         => intval($u['id']),
            'name'       => $u['name'],
            'email'      => $u['email'],
            'role'       => $u['role'],
            'created_at' => $u['created_at']
        ];
    }, $stmt->fetchAll());

    sendJSON([
        'success' => true,
        'count'   => count($users),
        'data'    => $users
    ]);
}

sendJSON(['success' => false, 'error' => 'Acción no válida'], 400);
