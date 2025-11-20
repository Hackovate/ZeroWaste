# ZeroWaste

**ZeroWaste** is a  food waste management web app helping users track food inventory, log consumption, and access sustainability resources. It aims to reduce household food waste through intelligent tracking and insights.

🔗 **Live Demo:** [https://zero-waste-xi.vercel.app/](https://zero-waste-xi.vercel.app/)  
📚 **Project Documentation:** [View on Gemini](https://gemini.google.com/share/c6b60643f0ef)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)

## ✨ Features

- **Inventory Tracking**: Keep tabs on your pantry and fridge items with expiration estimates.
- **Consumption Logging**: Log what you eat and what you waste to understand your habits.
- **Resource Hub**: Access educational content about sustainability and waste reduction.
- **Image Uploads**: Visually track items with image support powered by ImageKit.
- **Secure Accounts**: Personal data protection with robust authentication.

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 15 + React
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS v4
- **State Management:** React Context
- **Icons:** Lucide React
- **Notifications:** Sonner

### Backend

- **Runtime:** Node.js + Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT + Argon2
- **Validation:** Zod
- **Image Storage:** ImageKit
- **Security:** Helmet, CORS, Rate Limiting

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL installed and running

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd ZeroWaste
    ```

2.  **Install Frontend Dependencies:**

    ```bash
    cd client
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd ../server
    npm install
    ```

### Environment Configuration

#### Backend (`server/.env`)

Create a `.env` file in the `server` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zerowaste"

# JWT Auth
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# Server Config
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# ImageKit (Image Storage)
IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
```

#### Frontend (`client/.env.local`)

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### Running the Application

1.  **Start the Backend Server:**

    ```bash
    cd server
    # Generate Prisma Client
    npm run prisma:generate
    # Apply all migrations to database
    npm run prisma:migrate
    # (Optional) Open Prisma Studio to verify
    npm run prisma:studio
    # Start the server
    npm run server
    ```

    The server will start on `http://localhost:5000`.

2.  **Start the Frontend Client:**
    Open a new terminal:
    ```bash
    cd client
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## 📂 Project Structure

- **`client/`**: Next.js frontend application.
- **`server/`**: Express.js backend API.
- **`server/prisma/`**: Database schema and migrations.

## 📄 Documentation

- **Quick Start:** See `QUICK_START.md` for immediate setup instructions.
- **ImageKit Setup:** See `server/IMAGEKIT_SETUP.md` for detailed image storage configuration.
