# NMservices Admin Panel

A React-based administrative interface for managing users and orders, built using **react-admin**. This project handles data visualization and management via a REST API.

## Features

*   **Dashboard**: Overview of key metrics (Users, Orders).
*   **User Management**: View, create, and manage user details.
*   **Order Management**: View, update status/amount, and manage orders.
*   **Authentication**: Secure access via API Key (X-Admin-Key).

## Tech Stack

*   **Core**: React 18, TypeScript, Vite
*   **Framework**: react-admin, ra-data-simple-rest
*   **UI Library**: Material UI (MUI)
*   **Package Manager**: npm

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

*   `VITE_API_URL`: The base URL of your backend API.

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (by default).

### Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── dashboard/      # Dashboard component
├── orders/         # Order management components
├── providers/      # Data and Auth providers
├── users/          # User management components
├── types/          # TypeScript definitions
├── App.tsx         # Main application component
└── main.tsx        # Entry point
```

## Deployment

The application compiles to static files (`dist/`) and can be served by any web server (Nginx, Apache) or static hosting service.
