<?php
require_once __DIR__ . '/../config.php';

// ====== Configuración CORS ======
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ================================

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'POST':
        if ($action === 'create') {
            crearEmpleo($conn);
        }
        break;
    
    case 'GET':
        if ($action === 'list') {
            listarEmpleos($conn);
        } elseif ($action === 'empresa' && isset($_GET['empresa_id'])) {
            listarEmpleosPorEmpresa($conn, $_GET['empresa_id']);
        } elseif (isset($_GET['id'])) {
            obtenerEmpleo($conn, $_GET['id']);
        }
        break;
    
    case 'PUT':
        if ($action === 'update' && isset($_GET['id'])) {
            actualizarEmpleo($conn, $_GET['id']);
        }
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            eliminarEmpleo($conn, $_GET['id']);
        }
        break;
    
    default:
        sendResponse(false, 'Método no permitido', null, 405);
}

// Crear nuevo empleo
function crearEmpleo($conn) {
    $data = getJSONInput();
    
    // Validaciones
    if (empty($data['empresa_id']) || empty($data['titulo']) || empty($data['descripcion'])) {
        sendResponse(false, 'Empresa ID, título y descripción son obligatorios', null, 400);
    }
    
    try {
        // Verificar que la empresa existe
        $stmt = $conn->prepare("SELECT nombre FROM empresas WHERE id = ?");
        $stmt->execute([$data['empresa_id']]);
        $empresa = $stmt->fetch();
        
        if (!$empresa) {
            sendResponse(false, 'Empresa no encontrada', null, 404);
        }
        
        // Insertar empleo
        $stmt = $conn->prepare("
            INSERT INTO empleos (empresa_id, titulo, descripcion, requisitos, salario, modalidad, ubicacion, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')
        ");
        
        $stmt->execute([
            $data['empresa_id'],
            $data['titulo'],
            $data['descripcion'],
            $data['requisitos'] ?? null,
            $data['salario'] ?? null,
            $data['modalidad'] ?? 'presencial',
            $data['ubicacion'] ?? 'Huánuco'
        ]);
        
        $empleoId = $conn->lastInsertId();
        
        sendResponse(true, 'Empleo creado exitosamente', [
            'id' => $empleoId,
            'titulo' => $data['titulo'],
            'empresa' => $empresa['nombre'],
            'empresa_nombre' => $empresa['nombre'],
            'fecha' => date('d/m/Y'),
            'fecha_publicacion' => date('Y-m-d H:i:s')
        ], 201);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al crear empleo: ' . $e->getMessage(), null, 500);
    }
}

// Listar todos los empleos activos
function listarEmpleos($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT e.*, emp.nombre as empresa_nombre, emp.nombre as empresa
            FROM empleos e
            JOIN empresas emp ON e.empresa_id = emp.id
            WHERE e.estado = 'activo'
            ORDER BY e.fecha_publicacion DESC
        ");
        $stmt->execute();
        $empleos = $stmt->fetchAll();
        
        // Formatear fechas
        foreach ($empleos as &$empleo) {
            $empleo['fecha'] = date('d/m/Y', strtotime($empleo['fecha_publicacion']));
        }
        
        sendResponse(true, 'Empleos obtenidos', $empleos);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener empleos: ' . $e->getMessage(), null, 500);
    }
}

// Listar empleos de una empresa específica
function listarEmpleosPorEmpresa($conn, $empresaId) {
    try {
        $stmt = $conn->prepare("
            SELECT e.*, emp.nombre as empresa_nombre, emp.nombre as empresa,
            (SELECT COUNT(*) FROM postulaciones WHERE empleo_id = e.id) as num_postulaciones
            FROM empleos e
            JOIN empresas emp ON e.empresa_id = emp.id
            WHERE e.empresa_id = ?
            ORDER BY e.fecha_publicacion DESC
        ");
        $stmt->execute([$empresaId]);
        $empleos = $stmt->fetchAll();
        
        // Formatear fechas
        foreach ($empleos as &$empleo) {
            $empleo['fecha'] = date('d/m/Y', strtotime($empleo['fecha_publicacion']));
        }
        
        sendResponse(true, 'Empleos de la empresa obtenidos', $empleos);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener empleos: ' . $e->getMessage(), null, 500);
    }
}

// Obtener un empleo específico
function obtenerEmpleo($conn, $empleoId) {
    try {
        $stmt = $conn->prepare("
            SELECT e.*, emp.nombre as empresa_nombre, emp.nombre as empresa, emp.sector as empresa_sector
            FROM empleos e
            JOIN empresas emp ON e.empresa_id = emp.id
            WHERE e.id = ?
        ");
        $stmt->execute([$empleoId]);
        $empleo = $stmt->fetch();
        
        if (!$empleo) {
            sendResponse(false, 'Empleo no encontrado', null, 404);
        }
        
        $empleo['fecha'] = date('d/m/Y', strtotime($empleo['fecha_publicacion']));
        
        sendResponse(true, 'Empleo obtenido', $empleo);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener empleo: ' . $e->getMessage(), null, 500);
    }
}

// Actualizar empleo
function actualizarEmpleo($conn, $empleoId) {
    $data = getJSONInput();
    
    try {
        $stmt = $conn->prepare("
            UPDATE empleos 
            SET titulo = ?, descripcion = ?, requisitos = ?, salario = ?, modalidad = ?, ubicacion = ?, estado = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['titulo'],
            $data['descripcion'],
            $data['requisitos'] ?? null,
            $data['salario'] ?? null,
            $data['modalidad'] ?? 'presencial',
            $data['ubicacion'] ?? 'Huánuco',
            $data['estado'] ?? 'activo',
            $empleoId
        ]);
        
        sendResponse(true, 'Empleo actualizado exitosamente');
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al actualizar empleo: ' . $e->getMessage(), null, 500);
    }
}

// Eliminar empleo
function eliminarEmpleo($conn, $empleoId) {
    try {
        $stmt = $conn->prepare("DELETE FROM empleos WHERE id = ?");
        $stmt->execute([$empleoId]);
        
        sendResponse(true, 'Empleo eliminado exitosamente');
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al eliminar empleo: ' . $e->getMessage(), null, 500);
    }
}
?>