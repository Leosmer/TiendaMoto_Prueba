<?php
/**
 * ============================================================
 * APEX MOTO — Conexión y Gestión de Base de Datos MySQL
 * ============================================================
 */

// Configuración de cabeceras CORS globales y formato JSON
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=UTF-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Envío unificado de respuestas JSON
function sendJSON($data, $statusCode = 200) {
    setCorsHeaders();
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

// Obtener cuerpo de petición (soporta JSON crudo y form-data)
function getRequestBody() {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $json = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            return $json;
        }
    }
    return !empty($_POST) ? $_POST : [];
}

// Conexión PDO con auto-creación resiliente
function getDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = '127.0.0.1';
    $user = 'root';
    $pass = '';
    $dbname = 'tienda_motos';
    $charset = 'utf8mb4';

    try {
        // 1. Intentar conectar directamente a la base de datos
        $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        // 2. Si no existe la BD, conectar al servidor MySQL y crearla automáticamente
        try {
            $rootDsn = "mysql:host={$host};charset={$charset}";
            $rootPdo = new PDO($rootDsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // Reconectar a la base recién creada
            $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);

            // Cargar esquema si existe
            $sqlFile = __DIR__ . '/../data/database.sql';
            if (file_exists($sqlFile)) {
                $sqlContent = file_get_contents($sqlFile);
                $pdo->exec($sqlContent);
            }
        } catch (PDOException $ex) {
            sendJSON([
                'success' => false,
                'error' => 'Error de conexión a la base de datos MySQL: ' . $ex->getMessage()
            ], 500);
        }
    }

    return $pdo;
}
