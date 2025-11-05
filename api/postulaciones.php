<?php
require_once __DIR__ . '/../config.php'; // ✅ importante para conexión y funciones

// ======== Configuración CORS ========
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Si es una solicitud preflight (OPTIONS), respondemos sin continuar
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
            crearPostulacion($conn);
        }
        break;
    
    case 'GET':
        if ($action === 'usuario' && isset($_GET['usuario_id'])) {
            listarPostulacionesUsuario($conn, $_GET['usuario_id']);
        } elseif ($action === 'empresa' && isset($_GET['empresa_id'])) {
            listarPostulacionesEmpresa($conn, $_GET['empresa_id']);
        }
        break;
    
    case 'PUT':
        if ($action === 'update' && isset($_GET['id'])) {
            actualizarEstadoPostulacion($conn, $_GET['id']);
        }
        break;
    
    default:
        sendResponse(false, 'Método no permitido', null, 405);
}

// Crear nueva postulación
function crearPostulacion($conn) {
    $data = getJSONInput();
    
    if (empty($data['usuario_id']) || empty($data['empleo_id'])) {
        sendResponse(false, 'Usuario ID y Empleo ID son obligatorios', null, 400);
    }
    
    try {
        // Verificar que no exista ya una postulación
        $stmt = $conn->prepare("SELECT id FROM postulaciones WHERE usuario_id = ? AND empleo_id = ?");
        $stmt->execute([$data['usuario_id'], $data['empleo_id']]);
        if ($stmt->fetch()) {
            sendResponse(false, 'Ya has postulado a este empleo', null, 400);
        }
        
        // Verificar que el empleo existe y está activo
        $stmt = $conn->prepare("SELECT titulo, empresa_id FROM empleos WHERE id = ? AND estado = 'activo'");
        $stmt->execute([$data['empleo_id']]);
        $empleo = $stmt->fetch();
        
        if (!$empleo) {
            sendResponse(false, 'Empleo no encontrado o inactivo', null, 404);
        }
        
        // Obtener datos del usuario
        $stmt = $conn->prepare("SELECT nombre FROM usuarios WHERE id = ?");
        $stmt->execute([$data['usuario_id']]);
        $usuario = $stmt->fetch();
        
        // Crear postulación
        $stmt = $conn->prepare("
            INSERT INTO postulaciones (usuario_id, empleo_id, estado) 
            VALUES (?, ?, 'enviada')
        ");
        $stmt->execute([$data['usuario_id'], $data['empleo_id']]);
        
        $postulacionId = $conn->lastInsertId();
        
        // Calcular y guardar matching score
        calcularYGuardarMatching($conn, $data['usuario_id'], $data['empleo_id']);
        
        // Mensaje psicosocial de motivación
        $stmt = $conn->prepare("
            INSERT INTO mensajes_psicosociales (usuario_id, tipo, texto) 
            VALUES (?, 'motivacion', ?)
        ");
        $stmt->execute([
            $data['usuario_id'],
            '¡Excelente! Has postulado exitosamente a "' . $empleo['titulo'] . '". Recuerda que cada postulación es un paso hacia tu objetivo. Mantén la confianza en tus habilidades. ¡Mucho éxito!'
        ]);
        
        sendResponse(true, 'Postulación enviada exitosamente', [
            'id' => $postulacionId,
            'usuario' => $usuario['nombre'],
            'empleo' => $empleo['titulo'],
            'empleo_titulo' => $empleo['titulo'],
            'estado' => 'enviada',
            'fecha' => date('d/m/Y'),
            'fecha_postulacion' => date('Y-m-d H:i:s')
        ], 201);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al crear postulación: ' . $e->getMessage(), null, 500);
    }
}

// Calcular matching score con IA
function calcularYGuardarMatching($conn, $usuarioId, $empleoId) {
    try {
        // Obtener CV del usuario
        $stmt = $conn->prepare("SELECT fortalezas, profesion, habilidades FROM curriculums WHERE usuario_id = ?");
        $stmt->execute([$usuarioId]);
        $cv = $stmt->fetch();
        
        if (!$cv) return;
        
        // Obtener requisitos del empleo
        $stmt = $conn->prepare("SELECT requisitos, titulo, descripcion FROM empleos WHERE id = ?");
        $stmt->execute([$empleoId]);
        $empleo = $stmt->fetch();
        
        if (!$empleo) return;
        
        // Algoritmo de matching simple
        $score = 0;
        $fortalezasUsuario = strtolower($cv['fortalezas'] ?? '');
        $habilidadesUsuario = strtolower($cv['habilidades'] ?? '');
        $requisitosEmpleo = strtolower($empleo['requisitos'] ?? '');
        $descripcionEmpleo = strtolower($empleo['descripcion'] ?? '');
        
        $palabrasClave = array_filter(array_map('trim', explode(',', $fortalezasUsuario)));
        
        foreach ($palabrasClave as $palabra) {
            if (strpos($requisitosEmpleo, $palabra) !== false || strpos($descripcionEmpleo, $palabra) !== false) {
                $score += 20;
            }
        }
        
        if ($cv['profesion'] && stripos($empleo['titulo'], $cv['profesion']) !== false) {
            $score += 30;
        }
        
        $score = min($score, 100);
        
        // Guardar score
        $stmt = $conn->prepare("
            INSERT INTO matching_scores (usuario_id, empleo_id, score, criterios) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE score = ?, criterios = ?
        ");
        
        $criterios = json_encode([
            'fortalezas_match' => true,
            'profesion_match' => ($cv['profesion'] && stripos($empleo['titulo'], $cv['profesion']) !== false)
        ]);
        
        $stmt->execute([$usuarioId, $empleoId, $score, $criterios, $score, $criterios]);
        
    } catch(PDOException $e) {
        // Error silencioso, no afecta la postulación
    }
}

// Listar postulaciones de un usuario
function listarPostulacionesUsuario($conn, $usuarioId) {
    try {
        $stmt = $conn->prepare("
            SELECT p.*, e.titulo as empleo_titulo, e.salario, e.modalidad,
                   emp.nombre as empresa_nombre
            FROM postulaciones p
            JOIN empleos e ON p.empleo_id = e.id
            JOIN empresas emp ON e.empresa_id = emp.id
            WHERE p.usuario_id = ?
            ORDER BY p.fecha_postulacion DESC
        ");
        $stmt->execute([$usuarioId]);
        $postulaciones = $stmt->fetchAll();
        
        // Formatear fechas
        foreach ($postulaciones as &$post) {
            $post['fecha'] = date('d/m/Y', strtotime($post['fecha_postulacion']));
        }
        
        sendResponse(true, 'Postulaciones obtenidas', $postulaciones);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener postulaciones: ' . $e->getMessage(), null, 500);
    }
}

// Listar postulaciones recibidas por una empresa
function listarPostulacionesEmpresa($conn, $empresaId) {
    try {
        $stmt = $conn->prepare("
            SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email,
                   u.telefono as usuario_telefono, e.titulo as empleo_titulo,
                   c.profesion, c.fortalezas, c.experiencia,
                   COALESCE(m.score, 0) as matching_score
            FROM postulaciones p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN empleos e ON p.empleo_id = e.id
            LEFT JOIN curriculums c ON u.id = c.usuario_id
            LEFT JOIN matching_scores m ON p.usuario_id = m.usuario_id AND p.empleo_id = m.empleo_id
            WHERE e.empresa_id = ?
            ORDER BY p.fecha_postulacion DESC
        ");
        $stmt->execute([$empresaId]);
        $postulaciones = $stmt->fetchAll();
        
        // Formatear fechas
        foreach ($postulaciones as &$post) {
            $post['fecha'] = date('d/m/Y', strtotime($post['fecha_postulacion']));
        }
        
        sendResponse(true, 'Postulaciones obtenidas', $postulaciones);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener postulaciones: ' . $e->getMessage(), null, 500);
    }
}

// Actualizar estado de postulación
function actualizarEstadoPostulacion($conn, $postulacionId) {
    $data = getJSONInput();
    
    if (empty($data['estado'])) {
        sendResponse(false, 'Estado es obligatorio', null, 400);
    }
    
    $estadosValidos = ['enviada', 'revisada', 'entrevista', 'aceptada', 'rechazada'];
    if (!in_array($data['estado'], $estadosValidos)) {
        sendResponse(false, 'Estado inválido', null, 400);
    }
    
    try {
        $stmt = $conn->prepare("
            UPDATE postulaciones 
            SET estado = ?, notas = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $data['estado'],
            $data['notas'] ?? null,
            $postulacionId
        ]);
        
        // Si fue aceptada, mensaje de felicitación
        if ($data['estado'] === 'aceptada') {
            $stmt = $conn->prepare("SELECT usuario_id FROM postulaciones WHERE id = ?");
            $stmt->execute([$postulacionId]);
            $post = $stmt->fetch();
            
            if ($post) {
                $stmt = $conn->prepare("
                    INSERT INTO mensajes_psicosociales (usuario_id, tipo, texto) 
                    VALUES (?, 'felicitacion', ?)
                ");
                $stmt->execute([
                    $post['usuario_id'],
                    '¡Felicitaciones! Tu postulación ha sido aceptada. Este es el resultado de tu esfuerzo y dedicación. ¡Mucho éxito en esta nueva etapa!'
                ]);
            }
        }
        
        sendResponse(true, 'Estado actualizado exitosamente');
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al actualizar estado: ' . $e->getMessage(), null, 500);
    }
}
?>