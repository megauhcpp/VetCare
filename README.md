# VetCare - Veterinary Clinic Management System

A fullstack application built with React and Laravel 11 for managing veterinary clinic operations.

## Project Structure

```
VetCare/
├── frontend/          # React frontend application
├── backend/           # Laravel 11 backend API
└── README.md          # Project documentation
```

## Technologies Used

### Frontend
- React
- React Router
- Axios
- Tailwind CSS
- React Query

### Backend
- Laravel 11
- MySQL
- Laravel Sanctum (Authentication)
- Laravel Passport (API Authentication)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PHP 8.2 or higher
- Composer
- MySQL

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory
2. Install dependencies:
   ```bash
   composer install
   ```
3. Copy .env.example to .env and configure your database
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations:
   ```bash
   php artisan migrate
   ```
6. Start the development server:
   ```bash
   php artisan serve
   ```

## Features
- User authentication
- Patient management
- Appointment scheduling
- Medical records
- Inventory management
- Staff management

## License
This project is licensed under the MIT License.