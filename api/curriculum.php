<?php
require_once __DIR__ . '/../config.php'; // ✅ importante: conecta config.php

// ======== Configuración CORS ========
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Si es una solicitud preflight (OPTIONS), respondemos sin ejecutar más código
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ====================================

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'POST':
        if ($action === 'create') {
            crearCV($conn);
        }
        break;
    
    case 'GET':
        if ($action === 'usuario' && isset($_GET['usuario_id'])) {
            obtenerCVPorUsuario($conn, $_GET['usuario_id']);
        }
        break;
    
    case 'PUT':
        if ($action === 'update' && isset($_GET['usuario_id'])) {
            actualizarCV($conn, $_GET['usuario_id']);
        }
        break;
    
    default:
        sendResponse(false, 'Método no permitido', null, 405);
}

// Crear o actualizar CV
function crearCV($conn) {
    $data = getJSONInput();
    
    if (empty($data['usuario_id'])) {
        sendResponse(false, 'Usuario ID es obligatorio', null, 400);
    }
    
    try {
        // Verificar si ya existe un CV
        $stmt = $conn->prepare("SELECT id FROM curriculums WHERE usuario_id = ?");
        $stmt->execute([$data['usuario_id']]);
        $cvExistente = $stmt->fetch();
        
        if ($cvExistente) {
            // Actualizar CV existente
            $stmt = $conn->prepare("
                UPDATE curriculums 
                SET nombre = ?, email = ?, telefono = ?, tipo_discapacidad = ?, 
                    profesion = ?, experiencia = ?, fortalezas = ?, habilidades = ?, 
                    educacion = ?, texto_voz = ?
                WHERE usuario_id = ?
            ");
            
            $stmt->execute([
                $data['nombre'] ?? null,
                $data['email'] ?? null,
                $data['telefono'] ?? null,
                $data['tipoDiscapacidad'] ?? null,
                $data['profesion'] ?? null,
                $data['experiencia'] ?? null,
                $data['fortalezas'] ?? null,
                $data['habilidades'] ?? null,
                $data['educacion'] ?? null,
                $data['textoVoz'] ?? null,
                $data['usuario_id']
            ]);
            
            $mensaje = 'CV actualizado exitosamente';
            $cvId = $cvExistente['id'];
        } else {
            // Crear nuevo CV
            $stmt = $conn->prepare("
                INSERT INTO curriculums 
                (usuario_id, nombre, email, telefono, tipo_discapacidad, profesion, 
                 experiencia, fortalezas, habilidades, educacion, texto_voz) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['usuario_id'],
                $data['nombre'] ?? null,
                $data['email'] ?? null,
                $data['telefono'] ?? null,
                $data['tipoDiscapacidad'] ?? null,
                $data['profesion'] ?? null,
                $data['experiencia'] ?? null,
                $data['fortalezas'] ?? null,
                $data['habilidades'] ?? null,
                $data['educacion'] ?? null,
                $data['textoVoz'] ?? null
            ]);
            
            $cvId = $conn->lastInsertId();
            $mensaje = 'CV creado exitosamente';
            
            // Mensaje psicosocial de motivación
            $stmt = $conn->prepare("
                INSERT INTO mensajes_psicosociales (usuario_id, tipo, texto) 
                VALUES (?, 'motivacion', ?)
            ");
            $stmt->execute([
                $data['usuario_id'],
                '¡Excelente! Has completado tu currículum. Ahora el sistema buscará las mejores oportunidades para ti. Recuerda que tus fortalezas son únicas y valiosas.'
            ]);
        }
        
        // Devolver el CV completo
        $stmt = $conn->prepare("SELECT * FROM curriculums WHERE id = ?");
        $stmt->execute([$cvId]);
        $cvCompleto = $stmt->fetch();
        
        sendResponse(true, $mensaje, $cvCompleto, 201);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al guardar CV: ' . $e->getMessage(), null, 500);
    }
}

// Obtener CV por usuario
function obtenerCVPorUsuario($conn, $usuarioId) {
    try {
        $stmt = $conn->prepare("SELECT * FROM curriculums WHERE usuario_id = ?");
        $stmt->execute([$usuarioId]);
        $cv = $stmt->fetch();
        
        if (!$cv) {
            sendResponse(false, 'CV no encontrado', null, 404);
        }
        
        sendResponse(true, 'CV obtenido', $cv);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener CV: ' . $e->getMessage(), null, 500);
    }
}

// Actualizar CV
function actualizarCV($conn, $usuarioId) {
    crearCV($conn); // Usa la misma función que maneja ambos casos
}
?>