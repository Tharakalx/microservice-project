# 🚗 AutoCare – Full-Stack Microservices Application

<p align="center">
  <b>A production-style microservices application built with modern DevOps & Cloud-native practices</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot%20%7C%20Node.js-brightgreen" />
  <img src="https://img.shields.io/badge/API-Gateway-orange" />
  <img src="https://img.shields.io/badge/Database-MySQL-blue" />
  <img src="https://img.shields.io/badge/Container-Docker-2496ED" />
</p>

---

## 📌 Project Overview

**AutoCare** is a **full-stack microservices-based application** designed to simulate a **real-world production system**.

The project focuses on:
- Clean microservices separation  
- API Gateway-based architecture  
- Secure authentication with JWT  
- Dockerized services with isolated databases  

This project goes beyond tutorials and demonstrates **how real systems are designed, debugged, and run in production**.

---

## 🏗️ System Architecture

<p align="center">
  <img src="./architecture-diagram.png" alt="Architecture Diagram" width="85%" />
</p>

### 🔄 Request Flow


---

## 🧩 Tech Stack

### 🎨 Frontend
- React
- Axios
- Nginx (Production build serving)

### ⚙️ Backend
- **Spring Boot** – Booking Service, Vehicle Service
- **Node.js + Express** – Auth Service
- **Spring Cloud Gateway** – API Gateway

### 🗄️ Database
- MySQL  
- Separate database per microservice

### 🚀 DevOps / Infrastructure
- Docker
- Docker Compose
- Container networking
- Persistent volumes
- JWT authentication
- Gateway-level CORS handling

---

## 🔐 Authentication & Security Flow (JWT)

1. User logs in via `/auth/login`
2. Auth Service generates a **JWT**
3. Frontend stores JWT securely
4. Frontend sends JWT in `Authorization: Bearer <token>`
5. API Gateway:
   - Validates JWT
   - Extracts user ID
   - Injects `x-user-id` header
6. Downstream services trust gateway identity

✔ No service directly validates JWT  
✔ Gateway acts as **security boundary**

---

## 📂 Microservices Breakdown

### 🔑 Auth Service (Node.js + Express)
- User registration & login
- Password hashing (bcrypt)
- JWT token generation
- MySQL connection pooling
- Stateless service behind Gateway

### 📅 Booking Service (Spring Boot)
- Booking domain logic
- Spring Data JPA
- Hibernate ORM
- Dedicated MySQL database

### 🚘 Vehicle Service (Spring Boot)
- Vehicle domain logic
- Spring Data JPA
- Hibernate ORM
- Dedicated MySQL database

### 🌐 API Gateway (Spring Cloud Gateway)
- Central entry point
- Routing & filtering
- CORS handling
- JWT validation
- Header propagation

---

## 🐳 Docker Setup

### ▶️ Start the full system
```bash
docker compose up --build


