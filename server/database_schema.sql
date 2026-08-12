CREATE DATABASE IF NOT EXISTS win_instalaciones;
USE win_instalaciones;

CREATE TABLE IF NOT EXISTS tecnicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cuadrilla VARCHAR(50) NOT NULL,
    telefono VARCHAR(15) NOT NULL
);

CREATE TABLE IF NOT EXISTS instalaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) UNIQUE NOT NULL,
    status ENUM('programada', 'asignado', 'en_camino', 'en_proceso', 'finalizada') NOT NULL DEFAULT 'programada',
    tecnico_id INT NULL,
    eta VARCHAR(50) NULL,
    trafico VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id)
);

-- Insertar datos de prueba (Los mismos del mockData)
INSERT INTO tecnicos (id, nombre, cuadrilla, telefono) VALUES 
(1, 'Luis Gamarra', 'Cuadrilla Alpha 7', '987654321'),
(2, 'Carlos Rivas', 'Cuadrilla Beta 3', '912345678'),
(3, 'Roberto Mendoza', 'Cuadrilla Gamma 5', '923456789'),
(4, 'Miguel Sánchez', 'Cuadrilla Delta 2', '934567890')
ON DUPLICATE KEY UPDATE nombre=nombre;

INSERT INTO instalaciones (dni, status, tecnico_id, eta, trafico) VALUES 
('12345678', 'programada', NULL, NULL, NULL),
('87654321', 'asignado', 1, NULL, NULL),
('44556677', 'en_camino', 2, 'Llega en 18 minutos', 'Tráfico moderado en Av. Javier Prado'),
('99887766', 'en_proceso', 3, NULL, NULL),
('22223333', 'finalizada', 4, NULL, NULL)
ON DUPLICATE KEY UPDATE status=VALUES(status);