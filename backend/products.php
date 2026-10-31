<?php
// 1. ปลดล็อกระบบ CORS อนุญาตให้หน้าบ้าน React (Vite) เข้ามาดึงข้อมูลได้โดยไม่ติดบล็อกความปลอดภัย
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

include 'config.php';

$sql = "SELECT * FROM rice_products";
$result = $conn->query($sql);

// สร้างกล่องอะเรย์ว่างเพื่อเตรียมเก็บข้อมูลข้าว
$rice_array = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // แมปชื่อคอลัมน์จากฐานข้อมูลของคุณเข้าตัวแปร เพื่อส่งให้ React 
        // (เช็กชื่อคอลัมน์ในวงเล็บ [] ให้ตรงกับตารางในฐานข้อมูลของคุณด้วยนะครับ)
        $rice_item = array(
            "id" => $row['id'], // หรือชื่อคอลัมน์ id ใน DB ของคุณ
            "name" => $row['rice_name'], // ดึงชื่อข้าว
            "price" => isset($row['price']) ? $row['price'] : 0, // ดึงราคา (ถ้าไม่มีใส่ 0 ไว้ก่อน)
            "stock" => isset($row['stock']) ? $row['stock'] : 0  // ดึงสต็อก (ถ้าไม่มีใส่ 0 ไว้ก่อน)
        );
        
        // หย่อนข้อมูลแต่ละแถวลงไปในกล่องรวม
        array_push($rice_array, $rice_item);
    }
}

// 2. แปลงกล่องข้อมูลทั้งหมดให้กลายเป็นรูปแบบ JSON แล้วพ่นส่งออกไปให้ React
echo json_encode($rice_array, JSON_UNESCAPED_UNICODE);

$conn->close();
?>