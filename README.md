🎟️ Ticket Broker

A Full-Stack Event Ticket Booking Platform

Ticket Broker is a full-stack web application for discovering events, booking tickets, and managing users with secure authentication.
The system follows a backend-first architecture with a REST API and a modern React frontend.

🚀 Tech Stack
Frontend

React

React Router

Axios

CSS (custom, no UI framework)

Backend

ASP.NET Core (Web API)

MongoDB (Atlas)

JWT Authentication

BCrypt password hashing

Stripe (test mode, backend-ready)

🧠 System Architecture
React Frontend
   ↓ (HTTP / JSON)
ASP.NET Core Web API
   ↓
MongoDB Atlas
   ↓
Stripe Payment Gateway


Frontend never accesses the database directly

Backend handles:

Authentication

Business logic

Data validation

Payments

📁 Project Structure (Root)
TicketBroker/
├── backend/
├── frontend/
└── README.md

📦 Backend Structure (/backend)
backend/
├── Controllers/
│   ├── UsersController.cs        # Register, Verify, Login, JWT
│   ├── EventsController.cs       # Event listing & details
│   ├── TicketTypesController.cs  # Ticket categories per event
│   ├── BookingsController.cs     # Ticket booking logic
│   ├── PaymentsController.cs     # Stripe PaymentIntent
│   └── AdminController.cs        # Admin endpoints
│
├── Models/
│   ├── User.cs                   # User entity (MongoDB)
│   ├── Event.cs                  # Event entity
│   ├── TicketType.cs             # Ticket types
│   ├── Booking.cs                # Booking records
│   └── Payment.cs                # Payment records
│
├── Models/Requests/
│   ├── RegisterRequest.cs
│   ├── LoginRequest.cs
│   ├── VerifyRequest.cs
│   └── CreatePaymentIntentRequest.cs
│
├── Data/
│   └── MongoDbContext.cs          # MongoDB connection & collections
│
├── Services/
│   └── EmailService.cs            # Console-based email (dev mode)
│
├── Program.cs                     # App startup & middleware
├── appsettings.json               # Safe config (no secrets)
├── appsettings.Development.json   # Local secrets (gitignored)
└── TicketManagementSystemMongo.csproj

🗄️ MongoDB Collections
TicketManagementDB/
├── Users
├── Events
├── TicketTypes
├── Bookings
├── Payments
└── QRScanLogs


MongoDB is schema-less

Relationships handled using IDs

frontend/
│
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   │
│   ├── api/
│   │   └── api.js                # Axios instance / API calls
│   │
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   ├── Footer.js
│   │   ├── Footer.css
│   │   ├── EventCard.js          # Reusable event card (optional)
│   │   └── EventCard.css
│   │
│   ├── pages/
│   │   ├── Home.js               # Landing page (no login required)
│   │   ├── Home.css
│   │   ├── Events.js             # All events list
│   │   ├── Events.css
│   │   ├── EventDetails.js       # Single event details
│   │   ├── EventDetails.css
│   │   ├── BookTicket.js         # Booking + payment
│   │   ├── BookTicket.css
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Verify.js
│   │   └── Auth.css              # Shared auth styles
│   │
│   ├── routes/
│   │   └── ProtectedRoute.js     # JWT protected routes
│   │
│   ├── utils/
│   │   ├── auth.js               # token helpers (get/set/remove)
│   │   └── formatDate.js
│   │
│   ├── App.js                    # App layout & routes
│   ├── index.js                  # React entry point
│   ├── index.css                 # Global styles
│   │
│   └── assets/
│       ├── images/
│       │   └── logo.png
│       └── icons/
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md


🔐 Authentication Flow

User registers (/register)

Backend:

Hashes password

Generates verification code

Stores user in MongoDB

Verification code shown in backend console (dev mode)

User verifies account (/verify)

User logs in (/login)

Backend returns:

JWT token

User info (name, email)

Frontend:

Stores token & user in localStorage

Shows avatar + name in navbar

Enables protected routes

🧭 Page Flow
Page	Route	Access
Home	/	Public
Events	/events	Public
Event Details	/events/:id	Public
Book Ticket	/book/:id	Login required
Login	/login	Public
Register	/register	Public
Verify	/verify	Public
▶️ How to Run the Project
Backend
cd backend
dotnet restore
dotnet run


Swagger:

http://localhost:5208/swagger

Frontend
cd frontend
npm install
npm start


Frontend:

http://localhost:3000

🧪 Development Notes

Email verification uses console output (dev mode)

Passwords are never stored in plain text

JWT secures protected routes

MongoDB Atlas UI may show filters — API is source of truth

🔮 Future Enhancements

Real email (SMTP / SendGrid)

Stripe card UI

QR code ticket scanning

Admin dashboard UI

Role-based authorization

Deployment (Vercel + Render)

👨‍💻 Author

Md. Abdullah Al Noman Khan
Computer Science & Engineering
IUBAT – International University of Business Agriculture and Technology
