# Expense Tracker App

A complete full-stack Expense Tracker application built with React Native Expo for mobile and Node.js/Express with MongoDB for the backend.

## Project Overview

This app allows users to register, sign in, add/manage expenses, view expense analytics, and monitor spending by category.

## Features

- User registration and login with JWT authentication
- Add, edit, delete, list expenses with Zod validation
- Expense categories: Food, Travel, Shopping, Bills, Entertainment, Others
- Dashboard with monthly totals, category breakdown, and pie chart visualization
- Search and filter expenses by category, amount range, and text
- Persistent login via AsyncStorage
- Clean modern mobile UI with bottom tabs navigation using NativeWind (Tailwind CSS for React Native)
- Centralized API service with Axios
- Error handling and loading states

## Tech Stack

- Frontend: React Native Expo, React Navigation, Context API, Axios, AsyncStorage, NativeWind, Zod, react-native-chart-kit
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt
- Utilities: dotenv, CORS, express-validator

## Folder Structure

```
Expense_Tracker_App/
  backend/
    controllers/
    middleware/
    models/
    routes/
    config/
    utils/
    server.js
  mobile-app/
    components/
    context/
    navigation/
    screens/
    services/
    App.js
  README.md
  .gitignore
```

## Prerequisites

Before you start, make sure you have the following installed on your computer:
- **Node.js** (v16 or higher)
- **MongoDB** (running locally on your machine, or a MongoDB Atlas URI)
- **Expo Go app** (installed on your iOS or Android device if testing on a phone)

## Setup Instructions

### 1. Backend Setup

The backend is an Express/Node.js server that connects to MongoDB.

1. Open a new terminal window and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create a `.env` file in the `backend/` folder (you can copy from `.env.example` if it exists).
   - It should contain the following variables:
     ```env
     MONGO_URI=mongodb://localhost:27017/expense_tracker
     JWT_SECRET=supersecretjwtkey
     PORT=5000
     ```
   *(Note: If you are using MongoDB Atlas, replace the `MONGO_URI` with your connection string).*
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *You should see a message saying "Server running on port 5000" and "MongoDB Connected". Leave this terminal open and running.*

### 2. Frontend Setup

The frontend is a React Native app built using Expo.

1. Open a SECOND terminal window and navigate to the frontend directory:
   ```bash
   cd mobile-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the IP Address:
   - Open `mobile-app/services/api.js` in your code editor.
   - If you are testing on the **Web Browser**, make sure `baseURL` is set to `http://localhost:5000/api`.
   - If you are testing on a **Physical Phone via Expo Go**, you MUST change `localhost` to your computer's local Wi-Fi IPv4 address (e.g., `http://192.168.1.5:5000/api`). Your phone and PC must be on the same Wi-Fi network.
4. Start the Expo Development Server:
   ```bash
   npx expo start
   ```

### 3. View the App

Once Expo starts, you will see a QR code in your terminal.
- **To view on a Mobile Phone:** Open the **Expo Go** app on your phone and scan the QR code (use the Camera app on iOS, or the scan button inside Expo Go on Android).
- **To view on the Web Browser:** Press the **`w`** key in your terminal. The app will open in a new tab in your default browser.
- **To view on an Android Emulator:** Press the **`a`** key (make sure Android Studio is running).

## Environment Variables

Backend `.env` should include:

```env
MONGO_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=supersecretjwtkey
PORT=5000
```

## API Endpoints

### Auth

- `POST /api/auth/register`
  - Body: `{ name, email, password }`
- `POST /api/auth/login`
  - Body: `{ email, password }`

### Expenses (Protected)

- `GET /api/expenses`
- `POST /api/expenses`
  - Body: `{ amount, category, date?, note? }`
- `PUT /api/expenses/:id`
  - Body: `{ amount, category, date?, note? }`
- `DELETE /api/expenses/:id`


## Future Improvements

- Add dark/light theme toggle
- Offline sync and local cache with better conflict resolution
- Export reports to PDF or CSV
- Add push notifications and recurring expenses
- Implement more advanced charts (bar charts, line graphs)

## Notes

- Make sure the backend is running before launching the mobile app.
- For physical devices, use your machine IP address instead of `10.0.2.2`.
