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
    case 'POST':
        if ($action === 'register') {
            registrarEmpresa($conn);
        } elseif ($action === 'login') {
            loginEmpresa($conn);
        }
        break;
    
    case 'GET':
        if ($action === 'profile' && isset($_GET['id'])) {
            obtenerPerfil($conn, $_GET['id']);
        }
        break;
    
    default:
        sendResponse(false, 'Método no permitido', null, 405);
}

// Registrar nueva empresa
function registrarEmpresa($conn) {
    $data = getJSONInput();
    
    // Validaciones
    if (empty($data['nombre']) || empty($data['email']) || empty($data['password']) || empty($data['ruc'])) {
        sendResponse(false, 'Nombre, email, contraseña y RUC son obligatorios', null, 400);
    }
    
    if (!validarEmail($data['email'])) {
        sendResponse(false, 'Email inválido', null, 400);
    }
    
    if (strlen($data['password']) < 6) {
        sendResponse(false, 'La contraseña debe tener al menos 6 caracteres', null, 400);
    }
    
    if (strlen($data['ruc']) != 11 || !is_numeric($data['ruc'])) {
        sendResponse(false, 'RUC inválido (debe tener 11 dígitos)', null, 400);
    }
    
    try {
        // Verificar si el email ya existe
        $stmt = $conn->prepare("SELECT id FROM empresas WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            sendResponse(false, 'El email ya está registrado', null, 400);
        }
        
        // Verificar si el RUC ya existe
        $stmt = $conn->prepare("SELECT id FROM empresas WHERE ruc = ?");
        $stmt->execute([$data['ruc']]);
        if ($stmt->fetch()) {
            sendResponse(false, 'El RUC ya está registrado', null, 400);
        }
        
        // Hash de la contraseña
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        
        // Insertar empresa
        $stmt = $conn->prepare("
            INSERT INTO empresas (nombre, email, password, telefono, ruc, sector, descripcion) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['nombre'],
            $data['email'],
            $passwordHash,
            $data['telefono'] ?? null,
            $data['ruc'],
            $data['sector'] ?? null,
            $data['descripcion'] ?? null
        ]);
        
        $empresaId = $conn->lastInsertId();
        
        sendResponse(true, 'Empresa registrada exitosamente', [
            'id' => $empresaId,
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'telefono' => $data['telefono'] ?? null,
            'ruc' => $data['ruc'],
            'sector' => $data['sector'] ?? null,
            'tipo' => 'empresa'
        ], 201);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al registrar empresa: ' . $e->getMessage(), null, 500);
    }
}

// Login de empresa
function loginEmpresa($conn) {
    $data = getJSONInput();
    
    if (empty($data['email']) || empty($data['password'])) {
        sendResponse(false, 'Email y contraseña son obligatorios', null, 400);
    }
    
    try {
        $stmt = $conn->prepare("SELECT * FROM empresas WHERE email = ?");
        $stmt->execute([$data['email']]);
        $empresa = $stmt->fetch();
        
        if (!$empresa || !password_verify($data['password'], $empresa['password'])) {
            sendResponse(false, 'Credenciales inválidas', null, 401);
        }
        
        sendResponse(true, 'Login exitoso', [
            'id' => $empresa['id'],
            'nombre' => $empresa['nombre'],
            'email' => $empresa['email'],
            'telefono' => $empresa['telefono'],
            'ruc' => $empresa['ruc'],
            'sector' => $empresa['sector'],
            'descripcion' => $empresa['descripcion'],
            'tipo' => 'empresa'
        ]);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error en el login: ' . $e->getMessage(), null, 500);
    }
}

// Obtener perfil de empresa
function obtenerPerfil($conn, $empresaId) {
    try {
        $stmt = $conn->prepare("
            SELECT id, nombre, email, telefono, ruc, sector, descripcion, fecha_registro 
            FROM empresas WHERE id = ?
        ");
        $stmt->execute([$empresaId]);
        $empresa = $stmt->fetch();
        
        if (!$empresa) {
            sendResponse(false, 'Empresa no encontrada', null, 404);
        }
        
        sendResponse(true, 'Perfil obtenido', $empresa);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener perfil: ' . $e->getMessage(), null, 500);
    }
}
?>