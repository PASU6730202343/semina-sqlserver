<?php
$conn = new mysqli("localhost", "root", "", "rice_quality_db");

if ($conn->connect_error) {
    die("เชื่อมต่อฐานข้อมูลไม่สำเร็จ");
}
?>