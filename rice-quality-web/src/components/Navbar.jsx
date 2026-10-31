import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>🌾 Smart Rice Marketplace</h2>
      </div>
      <ul className="navbar-links">
        <li><a href="#home" className="active">หน้าแรก</a></li>
        <li><a href="#products">สินค้า</a></li>
        <li><a href="#about">เกี่ยวกับเรา</a></li>
        <li><a href="#contact">ติดต่อ</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;