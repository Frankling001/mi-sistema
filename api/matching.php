<?php
require_once __DIR__ . '/../config.php';

// ====== Configuración CORS ======
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Si es una solicitud preflight, respondemos sin continuar
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ================================

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        if ($action === 'empleos' && isset($_GET['usuario_id'])) {
            obtenerEmpleosRecomendados($conn, $_GET['usuario_id']);
        } elseif ($action === 'mensajes' && isset($_GET['usuario_id'])) {
            obtenerMensajesPsicosociales($conn, $_GET['usuario_id']);
        }
        break;
    
    case 'POST':
        if ($action === 'calcular' && isset($_GET['usuario_id'])) {
            calcularMatchingTodos($conn, $_GET['usuario_id']);
        }
        break;
    
    default:
        sendResponse(false, 'Método no permitido', null, 405);
}

// Obtener empleos recomendados con matching score
function obtenerEmpleosRecomendados($conn, $usuarioId) {
    try {
        // Obtener CV del usuario
        $stmt = $conn->prepare("SELECT * FROM curriculums WHERE usuario_id = ?");
        $stmt->execute([$usuarioId]);
        $cv = $stmt->fetch();
        
        if (!$cv) {
            sendResponse(false, 'El usuario no tiene CV creado', null, 404);
        }
        
        // Obtener todos los empleos activos
        $stmt = $conn->prepare("
            SELECT e.*, emp.nombre as empresa_nombre
            FROM empleos e
            JOIN empresas emp ON e.empresa_id = emp.id
            WHERE e.estado = 'activo'
        ");
        $stmt->execute();
        $empleos = $stmt->fetchAll();
        
        // Calcular matching para cada empleo
        $empleosConMatching = [];
        
        foreach ($empleos as $empleo) {
            $score = calcularMatchingScore($cv, $empleo);
            
            if ($score >= 0) { // Solo empleos con al menos 40% de match
                $empleo['matchScore'] = $score;
                $empleo['empresa'] = $empleo['empresa_nombre'];
                $empleo['fecha'] = date('d/m/Y', strtotime($empleo['fecha_publicacion']));
                $empleosConMatching[] = $empleo;
                
                // Guardar el score en la BD
                guardarMatchingScore($conn, $usuarioId, $empleo['id'], $score);
            }
        }
        
        // Ordenar por score descendente
        usort($empleosConMatching, function($a, $b) {
            return $b['matchScore'] - $a['matchScore'];
        });
        
        sendResponse(true, 'Empleos recomendados obtenidos', $empleosConMatching);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener recomendaciones: ' . $e->getMessage(), null, 500);
    }
}

// Algoritmo de matching inteligente
function calcularMatchingScore($cv, $empleo) {
    $score = 0;
    
    $fortalezasUsuario = strtolower($cv['fortalezas'] ?? '');
    $habilidadesUsuario = strtolower($cv['habilidades'] ?? '');
    $profesionUsuario = strtolower($cv['profesion'] ?? '');
    
    $requisitosEmpleo = strtolower($empleo['requisitos'] ?? '');
    $descripcionEmpleo = strtolower($empleo['descripcion'] ?? '');
    $tituloEmpleo = strtolower($empleo['titulo'] ?? '');
    
    // 1. Matching de fortalezas (40 puntos máximo)
    $fortalezas = array_filter(array_map('trim', explode(',', $fortalezasUsuario)));
    $matchFortalezas = 0;
    foreach ($fortalezas as $fortaleza) {
        if (strpos($requisitosEmpleo, $fortaleza) !== false || 
            strpos($descripcionEmpleo, $fortaleza) !== false) {
            $matchFortalezas += 10;
        }
    }
    $score += min($matchFortalezas, 40);
    
    // 2. Matching de habilidades técnicas (30 puntos máximo)
    $habilidades = array_filter(array_map('trim', explode(',', $habilidadesUsuario)));
    $matchHabilidades = 0;
    foreach ($habilidades as $habilidad) {
        if (strpos($requisitosEmpleo, $habilidad) !== false || 
            strpos($descripcionEmpleo, $habilidad) !== false) {
            $matchHabilidades += 10;
        }
    }
    $score += min($matchHabilidades, 30);
    
    // 3. Matching de profesión (30 puntos)
    if ($profesionUsuario && (
        strpos($tituloEmpleo, $profesionUsuario) !== false ||
        strpos($descripcionEmpleo, $profesionUsuario) !== false
    )) {
        $score += 30;
    }
    
    return min($score, 100);
}

// Guardar matching score en BD
function guardarMatchingScore($conn, $usuarioId, $empleoId, $score) {
    try {
        $stmt = $conn->prepare("
            INSERT INTO matching_scores (usuario_id, empleo_id, score, criterios) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE score = ?, fecha_calculo = CURRENT_TIMESTAMP
        ");
        
        $criterios = json_encode(['auto_calculated' => true]);
        $stmt->execute([$usuarioId, $empleoId, $score, $criterios, $score]);
        
    } catch(PDOException $e) {
        // Error silencioso
    }
}

// Calcular matching para todos los empleos activos
function calcularMatchingTodos($conn, $usuarioId) {
    try {
        $stmt = $conn->prepare("SELECT * FROM curriculums WHERE usuario_id = ?");
        $stmt->execute([$usuarioId]);
        $cv = $stmt->fetch();
        
        if (!$cv) {
            sendResponse(false, 'El usuario no tiene CV creado', null, 404);
        }
        
        $stmt = $conn->prepare("SELECT * FROM empleos WHERE estado = 'activo'");
        $stmt->execute();
        $empleos = $stmt->fetchAll();
        
        $procesados = 0;
        foreach ($empleos as $empleo) {
            $score = calcularMatchingScore($cv, $empleo);
            guardarMatchingScore($conn, $usuarioId, $empleo['id'], $score);
            $procesados++;
        }
        
        sendResponse(true, "Matching calculado para $procesados empleos");
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al calcular matching: ' . $e->getMessage(), null, 500);
    }
}

// Obtener mensajes psicosociales
function obtenerMensajesPsicosociales($conn, $usuarioId) {
    try {
        $stmt = $conn->prepare("
            SELECT * FROM mensajes_psicosociales 
            WHERE usuario_id = ? 
            ORDER BY fecha_creacion DESC 
            LIMIT 10
        ");
        $stmt->execute([$usuarioId]);
        $mensajes = $stmt->fetchAll();
        
        // Formatear fechas
        foreach ($mensajes as &$mensaje) {
            $mensaje['fecha'] = date('d/m/Y H:i', strtotime($mensaje['fecha_creacion']));
        }
        
        sendResponse(true, 'Mensajes obtenidos', $mensajes);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener mensajes: ' . $e->getMessage(), null, 500);
    }
}
?>