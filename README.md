# VetCare - Sistema de Gestión Veterinaria

Este es un proyecto full-stack para la gestión de una clínica veterinaria, desarrollado con React para el frontend y Laravel 11 para el backend.

## Estructura del Proyecto

```
VetCare/
├── backend/           # Laravel 11 backend
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   └── vendor/
│
└── frontend/          # React frontend
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

## Instrucciones de Configuración

### Backend (Laravel)

1. Navegar al directorio backend:
   ```bash
   cd VetCare/backend
   ```

2. Instalar dependencias:
   ```bash
   composer install
   ```

3. Copiar .env.example a .env:
   ```bash
   copy .env.example .env
   ```

4. Generar clave de aplicación:
   ```bash
   php artisan key:generate
   ```

5. Configurar la base de datos en el archivo .env

6. Ejecutar migraciones:
   ```bash
   php artisan migrate
   ```

7. Iniciar el servidor de desarrollo:
   ```bash
   php artisan serve
   ```

### Frontend (React)

1. Navegar al directorio frontend:
   ```bash
   cd VetCare/frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Desarrollo

- Backend API: http://localhost:8000
- Frontend: http://localhost:5173

## Características

- Frontend moderno con React y Vite
- Backend con Laravel 11 y soporte API
- Arquitectura RESTful
- Sistema de autenticación
- Migraciones y seeders de base de datos
- Documentación de API

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

## Features
- User authentication
- Patient management
- Appointment scheduling
- Medical records
- Inventory management
- Staff management

## License
This project is licensed under the MIT License.