<?php
require_once __DIR__ . '/../config.php'; // ✅ asegúrate de que esta ruta es correcta
// ======== Configuración CORS ========
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Si es una solicitud preflight (OPTIONS), terminamos aquí
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
        if ($action === 'register') {
            registrarUsuario($conn);
        } elseif ($action === 'login') {
            loginUsuario($conn);
        }
        break;
    
    case 'GET':
        if ($action === 'profile' && isset($_GET['id'])) {
            obtenerPerfil($conn, $_GET['id']);
        }
        break;
    
    default:
        // Usamos nuestra función de respuesta
        sendResponse(false, 'Método no permitido', null, 405);
}

// Registrar nuevo usuario (candidato)
function registrarUsuario($conn) {
    $data = getJSONInput();
    
    // Validaciones
    if (empty($data['nombre']) || empty($data['email']) || empty($data['password'])) {
        sendResponse(false, 'Nombre, email y contraseña son obligatorios', null, 400);
    }
    
    if (!validarEmail($data['email'])) {
        sendResponse(false, 'Email inválido', null, 400);
    }
    
    if (strlen($data['password']) < 6) {
        sendResponse(false, 'La contraseña debe tener al menos 6 caracteres', null, 400);
    }
    
    try {
        // Verificar si el email ya existe
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            sendResponse(false, 'El email ya está registrado', null, 400);
        }
        
        // Hash de la contraseña
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        
        // Insertar usuario
        $stmt = $conn->prepare("
            INSERT INTO usuarios (nombre, email, password, telefono, tipo_discapacidad) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['nombre'],
            $data['email'],
            $passwordHash,
            $data['telefono'] ?? null, // '?? null' es bueno para campos opcionales
            $data['tipoDiscapacidad'] ?? null
        ]);
        
        $userId = $conn->lastInsertId();
        
        // Mensaje psicosocial de bienvenida
        $stmt = $conn->prepare("
            INSERT INTO mensajes_psicosociales (usuario_id, tipo, texto) 
            VALUES (?, 'motivacion', ?)
        ");
        $stmt->execute([
            $userId,
            '¡Bienvenido/a al sistema! Estamos aquí para acompañarte en tu búsqueda laboral. Recuerda que tus habilidades y fortalezas son valiosas. ¡Adelante!'
        ]);
        
        sendResponse(true, 'Usuario registrado exitosamente', [
            'id' => $userId,
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'telefono' => $data['telefono'] ?? null,
            'tipoDiscapacidad' => $data['tipoDiscapacidad'] ?? null,
            'tipo' => 'candidato'
        ], 201);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al registrar usuario: ' . $e->getMessage(), null, 500);
    }
}

// Login de usuario
function loginUsuario($conn) {
    $data = getJSONInput();
    
    if (empty($data['email']) || empty($data['password'])) {
        sendResponse(false, 'Email y contraseña son obligatorios', null, 400);
    }
    
    try {
        $stmt = $conn->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$data['email']]);
        $usuario = $stmt->fetch();
        
        if (!$usuario || !password_verify($data['password'], $usuario['password'])) {
            sendResponse(false, 'Credenciales inválidas', null, 401);
        }
        
        // Obtener CV si existe
        $stmt = $conn->prepare("SELECT * FROM curriculums WHERE usuario_id = ?");
        $stmt->execute([$usuario['id']]);
        $cv = $stmt->fetch();
        
        sendResponse(true, 'Login exitoso', [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'email' => $usuario['email'],
            'telefono' => $usuario['telefono'],
            'tipoDiscapacidad' => $usuario['tipo_discapacidad'],
            'tipo' => 'candidato',
            'cvData' => $cv ?: null
        ]);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error en el login: ' . $e->getMessage(), null, 500);
    }
}

// Obtener perfil de usuario
function obtenerPerfil($conn, $userId) {
    try {
        $stmt = $conn->prepare("SELECT id, nombre, email, telefono, tipo_discapacidad, fecha_registro FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            sendResponse(false, 'Usuario no encontrado', null, 404);
        }
        
        sendResponse(true, 'Perfil obtenido', $usuario);
        
    } catch(PDOException $e) {
        sendResponse(false, 'Error al obtener perfil: ' . $e->getMessage(), null, 500);
    }
}
?>
