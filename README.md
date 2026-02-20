# GreenLens 🌿🔍

> **Sustainable Shopping Companion**  
> GreenLens is a full-stack application that helps users make eco-friendly shopping choices by scanning product barcodes to reveal their carbon footprint and eco-score.

## 🚀 Project Structure

This is a monorepo containing both the frontend and backend applications:

*   **`frontend/`**: Next.js 16 application (The User Interface)
*   **`backend/`**: Next.js 14 application providing the API & Database (The Brains)

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js** (v18 or higher)
*   **PostgreSQL** (Database)

---

## ⚡ Quick Start Guide

### 1. Backend Setup (Port 3001)

The backend handles the database connection, authentication, and product data.

1.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the `backend` directory:
    ```env
    # Database Connection
    # Replace 'user:password' with your PostgreSQL credentials
    DATABASE_URL="postgresql://postgres:your_password@localhost:5432/greenlens"

    # Authentication
    NEXTAUTH_URL="http://localhost:3001"
    NEXTAUTH_SECRET="your-super-secret-key"

    # CORS (Optional, allows frontend to communicate)
    CORS_ORIGINS="http://localhost:3000"
    ```

4.  **Setup Database**:
    Initialize the database and seed it with starter data (products, users, etc.):
    ```bash
    npx prisma db push
    npm run db:seed
    ```

5.  **Run the Backend**:
    Start the server on port **3001**:
    ```bash
    npm run dev -- -p 3001
    ```

### 2. Frontend Setup (Port 3000)

The frontend is the web application you interact with.

1.  **Open a NEW terminal** (keep the backend running) and navigate to the frontend:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file in the `frontend` directory:
    ```env
    # Point to the running backend
    NEXT_PUBLIC_API_URL=http://localhost:3001
    ```

4.  **Run the Frontend**:
    Start the application on port **3000**:
    ```bash
    npm run dev
    ```

---

## 📱 How to Use

1.  Open your browser and visit: **http://localhost:3000**
2.  **Log In / Register**: create an account to track your eco-impact.
3.  **Scan Products**:
    *   Click "Scan" and use your camera to scan a product barcode.
    *   Or upload an image of a barcode.
    *   We recently improved the scanner to handle various lighting conditions better! 📸
4.  **View Results**: See the carbon footprint, eco-score, and sustainable alternatives for the product.

---

## 🧰 Tech Stack

**Frontend:**
*   **Framework**: Next.js 16 (App Router)
*   **Styling**: Tailwind CSS
*   **Components**: Shadcn UI, Lucide Icons, Framer Motion
*   **Scanning**: HTML5-QRCode

**Backend:**
*   **Framework**: Next.js 14 API Routes
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Auth**: NextAuth.js

---

## 🐛 Troubleshooting

*   **"No MultiFormat Readers were able to detect the code"**: Ensure good lighting and that the barcode is in focus. We have optimized the scanner for high-quality captures, but clear images are key.
*   **Connection Error**: Ensure the backend is running on port 3001 and the frontend `.env.local` points to it correctly.
