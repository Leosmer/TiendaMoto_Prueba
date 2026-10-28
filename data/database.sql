-- ============================================================
-- APEX MOTO — Esquema de Base de Datos MySQL
-- ============================================================
-- Base de datos para Catálogo CRUD, Autenticación, Órdenes,
-- Citas de Taller, Solicitudes de Prueba y Mensajes de Contacto.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `tienda_motos` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `tienda_motos`;

-- 1. TABLA: USUARIOS (Autenticación y Roles)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: MOTOCICLETAS (Inventario y CRUD)
CREATE TABLE IF NOT EXISTS `motorcycles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `model` VARCHAR(100) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `cc` INT NOT NULL,
  `hp` INT NOT NULL,
  `torque` VARCHAR(50) DEFAULT '110 Nm',
  `weight` INT DEFAULT 185,
  `tank` DECIMAL(5,1) DEFAULT 16.0,
  `brakes` VARCHAR(100) DEFAULT 'Brembo Radial',
  `price` DECIMAL(12,2) NOT NULL,
  `condition_state` VARCHAR(50) NOT NULL DEFAULT 'Nuevo',
  `year` INT NOT NULL DEFAULT 2026,
  `color` VARCHAR(100) DEFAULT 'Edición Especial',
  `image` TEXT NOT NULL,
  `gallery` TEXT NULL,
  `description` TEXT NOT NULL,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: ÓRDENES Y RESERVAS (Checkout)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `delivery_mode` VARCHAR(50) NOT NULL DEFAULT 'pickup',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'card',
  `items_json` LONGTEXT NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Confirmado',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: MENSAJES DE CONTACTO
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: CITAS DE TALLER
CREATE TABLE IF NOT EXISTS `workshop_appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `bike` VARCHAR(100) NOT NULL,
  `service` VARCHAR(100) NOT NULL,
  `notes` TEXT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA: PRUEBAS DE MANEJO (Test Drives)
CREATE TABLE IF NOT EXISTS `test_drives` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(100) NOT NULL DEFAULT 'Cliente',
  `customer_email` VARCHAR(150) NULL,
  `bike_model` VARCHAR(100) NOT NULL,
  `bike_brand` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Solicitado',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERCIÓN DE USUARIOS POR DEFECTO
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Admin Apex', 'admin@apexmoto.com', 'admin123', 'admin'),
(2, 'Carlos Mendoza', 'cliente@apexmoto.com', 'cliente123', 'user')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- INSERCIÓN DE MOTOCICLETAS POR DEFECTO
INSERT INTO `motorcycles` (`id`, `model`, `brand`, `type`, `cc`, `hp`, `torque`, `weight`, `tank`, `brakes`, `price`, `condition_state`, `year`, `color`, `image`, `gallery`, `description`, `featured`) VALUES
(1, 'Panigale V4 SP2', 'Ducati', 'Deportiva', 1103, 210, '124 Nm', 173, 16.0, 'Brembo Stylema R', 42900.00, 'Nuevo', 2026, 'Winter Test Livery', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80', '["https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80","https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80"]', 'La superbike definitiva de Ducati. Motor Desmosedici Stradale V4, electrónica MotoGP y aerodinámica avanzada.', 1),
(2, 'MT-09 SP', 'Yamaha', 'Naked', 890, 119, '93 Nm', 190, 14.0, 'Brembo radial', 12500.00, 'Nuevo', 2026, 'Icon Performance', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80', '["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80","https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80","https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&q=80"]', 'Agresividad naked con motor CP3 de triple cilindro. Suspensión Öhlins, frenos Brembo y electrónica de última generación.', 0),
(3, 'Africa Twin 1100', 'Honda', 'Enduro', 1084, 102, '105 Nm', 226, 24.8, 'Doble disco 310mm', 18900.00, 'Nuevo', 2025, 'Grand Prix Red', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80', '["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80","https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"]', 'La aventurera por excelencia. DCT opcional, tracción trasera y electrónica HSTC para conquistar cualquier terreno.', 0),
(4, 'Sportster S', 'Harley-Davidson', 'Custom', 1252, 121, '127 Nm', 228, 11.8, 'Brembo doble disco', 16999.00, 'Nuevo', 2026, 'Vivid Black', 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&q=80', '["https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&q=80","https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80","https://images.unsplash.com/photo-1558981033-7c0a19beb28d?w=800&q=80"]', 'La nueva era Sportster. Motor Revolution Max 1250T refrigerado por líquido con el carácter inconfundible H-D.', 1),
(5, 'Z900', 'Kawasaki', 'Naked', 948, 125, '98.6 Nm', 210, 17.0, 'Doble disco 300mm', 11200.00, 'Usado', 2024, 'Metallic Spark Black', 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800&q=80', '["https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800&q=80","https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80","https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80"]', 'Supernaked con diseño Sugomi. Motor tetracilíndrico en línea, chasis ligero y una relación precio-rendimiento imbatible.', 0),
(6, 'R 1250 GS Adventure', 'BMW', 'Enduro', 1254, 136, '143 Nm', 268, 30.0, 'Brembo integral ABS Pro', 24500.00, 'Nuevo', 2026, 'GS Trophy', 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80', '["https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80","https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80","https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80"]', 'La reina del adventure touring. Motor boxer ShiftCam, Dynamic ESA, pantalla TFT 6.5" y conectividad total.', 0),
(7, 'CBR600RR', 'Honda', 'Deportiva', 599, 121, '63 Nm', 186, 18.0, 'Doble disco 310mm Nissin', 13800.00, 'Usado', 2023, 'Grand Prix Red/Black', 'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800&q=80', '["https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800&q=80","https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"]', 'La supersport de referencia. Línea directa con la RC213V de MotoGP, winglets aerodinámicos y electrónica avanzada.', 0),
(8, 'XMAX 300', 'Yamaha', 'Scooter', 292, 27.6, '29.4 Nm', 179, 13.0, 'Disco 267mm / 245mm ABS', 7200.00, 'Nuevo', 2026, 'Power Grey', 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80', '["https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80","https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80","https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80"]', 'El maxi-scooter premium para la ciudad. Motor Blue Core, conectividad smartphone, amplio espacio de almacenamiento.', 0)
ON DUPLICATE KEY UPDATE `model`=`model`;
