🎟️ Ticket Management System

ASP.NET Core Web API + MongoDB + Stripe + React

A full-stack ticket booking and management system designed with a backend-first architecture, featuring secure authentication, event & ticket management, Stripe payment integration, and a React frontend.

This project demonstrates real-world full-stack development practices, clean API design, database integration, and frontend–backend communication.

📌 Project Overview

The Ticket Management System allows users to:

Register and verify accounts

Browse events

Book tickets

Initiate secure payments

Validate tickets via QR scan (backend-ready)

Manage data through admin endpoints

The system is built using:

Backend: ASP.NET Core Web API

Database: MongoDB (Atlas)

Payments: Stripe (test mode)

Frontend: React

🏗️ Architecture Overview
React Frontend
      ↓ (HTTP / JSON)
ASP.NET Core Web API
      ↓
MongoDB Atlas
      ↓
Stripe Payment Gateway


RESTful API architecture

JWT-based authentication

Backend handles all business logic

Frontend consumes APIs only (no direct DB access)

📁 Complete Project Structure
TicketManagementSystem/
│
├── backend/                         # ASP.NET Core Web API
│   │
│   ├── Controllers/
│   │   ├── UsersController.cs
│   │   ├── EventsController.cs
│   │   ├── TicketTypesController.cs
│   │   ├── BookingsController.cs
│   │   ├── PaymentsController.cs
│   │   ├── QRScanController.cs
│   │   └── AdminController.cs
│   │
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Event.cs
│   │   ├── TicketType.cs
│   │   ├── Booking.cs
│   │   ├── Payment.cs
│   │   ├── QRScanLog.cs
│   │   └── DashboardViewModel.cs
│   │
│   ├── Models/Requests/
│   │   ├── LoginRequest.cs
│   │   ├── VerifyRequest.cs
│   │   └── CreatePaymentIntentRequest.cs
│   │
│   ├── Data/
│   │   └── MongoDbContext.cs
│   │
│   ├── Services/
│   │   └── EmailService.cs          # Console-based for testing
│   │
│   ├── Properties/
│   │   └── launchSettings.json
│   │
│   ├── Program.cs
│   ├── appsettings.json             # NO secrets (safe for GitHub)
│   ├── appsettings.Development.json # Local secrets (ignored)
│   └── TicketManagementSystemMongo.csproj
│
├── frontend/                        # React Frontend
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js               # API connection layer
│   │   │
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Verify.js
│   │   │   ├── Events.js
│   │   │   └── BookTicket.js
│   │   │
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md                        # This file

🗄️ Database Collections (MongoDB)
TicketManagementDB
│
├── Users
├── Events
├── TicketTypes
├── Bookings
├── Payments
└── QRScanLogs


Each collection is linked using IDs (manual references).

🔐 Security Features

Password hashing using BCrypt

JWT authentication

Email verification (6-digit code)

Stripe secret keys never exposed

Secrets stored only in appsettings.Development.json

🔗 API Endpoints Summary
Authentication
POST /api/users/register
POST /api/users/verify
POST /api/users/login

Events & Tickets
GET  /api/events
POST /api/events
GET  /api/tickettypes
POST /api/tickettypes

Bookings & Payments
POST /api/bookings
POST /api/payments/create-intent
POST /api/payments/webhook

QR Validation & Admin
POST /api/qrscan/scan
GET  /api/admin/dashboard

⚙️ How to Run the Project (Step-by-Step)
✅ Prerequisites

.NET SDK 8.0+

Node.js (LTS)

MongoDB Atlas account

Stripe account (Test mode)

Internet connection

▶️ Backend Setup
1️⃣ Navigate to backend
cd backend

2️⃣ Configure appsettings.Development.json
{
  "MongoDbSettings": {
    "ConnectionString": "mongodb+srv://<username>:<password>@cluster.mongodb.net",
    "DatabaseName": "TicketManagementDB"
  },
  "Stripe": {
    "SecretKey": "sk_test_XXXX",
    "PublishableKey": "pk_test_XXXX",
    "WebhookSecret": "whsec_XXXX"
  },
  "Jwt": {
    "Key": "YourJwtSecretKey",
    "Issuer": "TicketManagementAPI"
  }
}


⚠️ Never commit this file

3️⃣ Run backend
dotnet restore
dotnet run


Swagger will be available at:

http://localhost:XXXX/swagger

▶️ Frontend Setup
1️⃣ Navigate to frontend
cd frontend

2️⃣ Install dependencies
npm install

3️⃣ Start React app
npm start


Frontend runs at:

http://localhost:3000

🧪 Stripe Testing Notes

Backend-only PaymentIntent creation

Webhooks verify payment success

Card UI can be added later

No card data stored on server

🚀 Current Status

✔ Backend complete
✔ MongoDB connected
✔ Stripe integrated
✔ React frontend connected
✔ GitHub secure (no secrets)

🔮 Future Enhancements

Stripe card UI

QR image generation

Role-based authorization

Admin frontend dashboard

Deployment (Vercel + Render)

Email service (SMTP)

👨‍💻 Author

Md. Abdullah Al Noman Khan
Computer Science & Engineering
IUBAT – International University of Business Agriculture and Technology
