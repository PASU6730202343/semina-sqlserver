# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # 'farmer' or 'buyer'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    products = relationship("Product", back_populates="owner")
    purchases = relationship("Transaction", foreign_keys="[Transaction.buyer_id]", back_populates="buyer")
    sales = relationship("Transaction", foreign_keys="[Transaction.seller_id]", back_populates="seller")


class Product(Base):
    __tablename__ = "riceproducts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    stock = Column(Integer, default=0)
    rice_standard = Column(String, default="general")
    rice_variety = Column(String, nullable=True)
    unit = Column(String, default="ถุง (5 กก.)")
    image_url = Column(Text, nullable=True)
    broken_rice_percentage = Column(Float, nullable=True, default=0.0)
    ai_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="products")
    transactions = relationship("Transaction", back_populates="product")
    price_predictions = relationship("AIPrediction", back_populates="product")
    rice_analysis_results = relationship("RiceAnalysisResult", back_populates="product")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("riceproducts.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    quantity = Column(Float)
    final_price = Column(Float)
    status = Column(String, default="completed") # 'pending', 'completed', 'cancelled'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="transactions")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="purchases")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="sales")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("riceproducts.id"), nullable=True) # Optional link to specific product
    suggested_price = Column(Float)
    factors = Column(Text) # JSON string of factors used for prediction
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="price_predictions")


class RiceAnalysisResult(Base):
    __tablename__ = "rice_analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("riceproducts.id"))
    total_grains = Column(Integer)
    whole_grains = Column(Integer)
    broken_grains = Column(Integer)
    broken_percentage = Column(Float)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="rice_analysis_results")
