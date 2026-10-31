import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);

  // ฟังก์ชันดึงข้อมูลข้าวจากฝั่ง PHP Database หลังบ้าน
  useEffect(() => {
    fetch("http://localhost/backend/products.php") // <--- ปรับ URL ให้ตรงกับ Path PHP ของคุณนะครับ
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching data: ", err));
  }, []);

  return (
    <div className="app-container">
      {/* 1. ส่วนแถบเมนูด้านบน */}
      <Navbar />

      {/* 2. ส่วนแบนเนอร์ต้อนรับหลัก */}
      <Hero />

      {/* 3. ส่วนแสดงรายการข้าวสารจาก Database */}
      <main className="main-content">
        <h2 className="section-title">🌾 รายการข้าวสารของเรา</h2>
        
        <div className="product-grid">
          {products.length > 0 ? (
            products.map((rice) => (
              <div key={rice.id} className="rice-card">
                <div className="rice-image-placeholder">🌾</div>
                <div className="rice-info">
                  <h3>{rice.name || "\u0e0a\u0e37\u0e48\u0e2d\u0e02\u0e49\u0e32\u0e27\u0e2a\u0e32\u0e23"}</h3>
                  <p className="rice-price">{"\u0e23\u0e32\u0e04\u0e32:"} {rice.price || "0"} {"\u0e1a\u0e32\u0e17"}</p>
                  <p className="rice-stock">{"\u0e04\u0e07\u0e40\u0e2b\u0e25\u0e37\u0e2d:"} {rice.stock || "0"} {"\u0e16\u0e38\u0e07"}</p>
                  <button className="buy-btn">{"\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e25\u0e07\u0e15\u0e30\u0e01\u0e23\u0e49\u0e32"}</button>
                </div>
              </div>
            ))
          ) : (
            <p role="status">{"\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e02\u0e49\u0e32\u0e27\u0e2a\u0e32\u0e23 \u0e2b\u0e23\u0e37\u0e2d\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e15\u0e48\u0e2d\u0e23\u0e30\u0e1a\u0e1a\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32\u0e44\u0e14\u0e49"}</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;