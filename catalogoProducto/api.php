<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");  // Permite peticiones externas si es necesario

// Base de data AwardSpace
$host = "fdb1032.awardspace.net";
$db_name = "4717062_catalogov3";
$username = "4717062_catalogov3";
$password = "LV!J2Uw)09VBBw2Q";

try {  // Conecxion con la base de datos
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "error" => "Error de conexión: " . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

// --------------------------------------- GUARDAR --------------------------------------- //
if ($action === 'guardar') {
    $data = json_decode(file_get_contents("php://input"), true);  // Recibe datos JSON del fetch

    if (!isset($data['id']) || !isset($data['name']) || !isset($data['precio'])) {  // Comprueba que existen las variables
        echo json_encode(["success" => false, "error" => "Datos incompletos"]);
        exit;
    }

    try {
        // Valida el ID para ver si esta duplicado
        $checkStmt = $conn->prepare("SELECT id FROM productos WHERE id = ?");
        $checkStmt->execute([$data['id']]);
        
        if ($checkStmt->rowCount() > 0) {
            echo json_encode(["success" => false, "error" => "Error: El ID ya está registrado en la base de datos"]); // [cite: 69]
        } else {
            // Si el ID no esta duplicado guarda los datos en la base de datos
            $stmt = $conn->prepare("INSERT INTO productos (id, name, description, precio, imagen) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['id'], $data['name'], $data['desc'], $data['precio'], $data['imagen']]);
            echo json_encode(["success" => true, "message" => "Producto guardado con éxito"]); // [cite: 68]
        }

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error SQL: " . $e->getMessage()]);
    }
}

// --------------------------------------- BORRAR --------------------------------------- //
elseif ($action === 'borrar') { 
    $id = $_GET['id'] ?? null;

    if (!$id) {  // Comprueba el ID
        echo json_encode(["success" => false, "error" => "Falta el ID"]);
        exit;
    }

    try {  // Elimina el producto segun el ID, si no se elimina nada devuelve un error
        $stmt = $conn->prepare("DELETE FROM productos WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Producto borrado con éxito"]);
        } else {
            echo json_encode(["success" => false, "error" => "Producto no encontrado"]);
        }

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error al borrar: " . $e->getMessage()]);
    }
}

// --------------------------------------- LISTAR --------------------------------------- //
elseif ($action === 'listar') {
    try {  // Devuelve un array con todos los productos de la base de datos
        $stmt = $conn->query("SELECT id, name, description AS `desc`, precio, imagen FROM productos");
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $productos
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
    }

} else {  // Si la accion no es ninguna de las anteriores da un error
    echo json_encode(["success" => false, "error" => "Acción no válida"]);
}
?>