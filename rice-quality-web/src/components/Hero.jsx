import React from "react";
import "./Hero.css";

function Hero() {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <h1>ยินดีต้อนรับสู่ ตลาดกลางข้าวสารอัจฉริยะ</h1>
        <p>คัดสรรข้าวสารคุณภาพดี ส่งตรงจากชาวนาไทย สู่มือคุณด้วยระบบตรวจสอบคุณภาพที่เชื่อถือได้</p>
        <a href="#products" className="hero-btn">เลือกซื้อข้าวสารเลย</a>
      </div>
    </div>
  );
}

export default Hero;