# Appointment Booking System

A full-stack appointment booking system built with:

## 🔧 Tech Stack
- Frontend: React (Vite)
- Backend: Fastify (Node.js)
- Database: MySQL
- Authentication: JWT
- Password Hashing: bcrypt

## ✨ Features
- Secure login & registration
- JWT-based authentication
- Create / edit / delete appointments
- Auto-expire past appointments
- Prevent double booking
- Multi-user support
- Real-time auto refresh
- Clean UI with filters

## 📁 Project Structure
appointment-booking-system/
├── backend/
├── frontend/


## ⚙️ Setup Instructions

### Backend
```bash
cd backend/appointment-booking-fastify
npm install
cp .env.example .env
node src/server.js

Frontend
cd frontend/appointment-ui
npm install
npm run dev