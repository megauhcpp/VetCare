# 🐾 VetCare - Sistema de Gestión Veterinaria

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat-square&logo=mysql)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

VetCare es una solución integral de gestión veterinaria diseñada para modernizar y optimizar las operaciones de clínicas veterinarias. El sistema ofrece una interfaz intuitiva y potentes herramientas de gestión para mejorar la atención a pacientes y la eficiencia operativa.

## 📋 Características Principales

### 🏥 Gestión de Pacientes
- Registro completo de mascotas
- Historial médico digital
- Seguimiento de vacunas y tratamientos
- Gestión de propietarios

### 📅 Gestión de Citas
- Sistema de citas online
- Calendario interactivo
- Recordatorios automáticos
- Historial de visitas

### 💊 Gestión de Inventario
- Control de medicamentos
- Gestión de suministros
- Alertas de stock bajo
- Registro de proveedores

### 👥 Gestión de Personal
- Control de acceso por roles
- Gestión de horarios
- Registro de especialidades
- Seguimiento de rendimiento

## 🛠️ Tecnologías Implementadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces de usuario
- **Vite** - Build tool y servidor de desarrollo
- **React Router** - Enrutamiento de aplicaciones
- **React Query** - Gestión de estado y caché
- **TailwindCSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas

### Backend
- **Laravel 12** - Framework PHP
- **MySQL 8.0** - Sistema de gestión de base de datos
- **Laravel Sanctum** - Autenticación API
- **Laravel Passport** - OAuth2 Server
- **Laravel Telescope** - Debugging y monitoreo
- **Laravel Dusk** - Testing de navegador
- **PHPUnit** - Testing unitario

## 🚀 Requisitos del Sistema

- PHP >= 8.2
- Node.js >= 18.x
- MySQL >= 8.0
- Composer >= 2.x
- npm >= 9.x

## 📦 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/vetcare.git
cd vetcare
```

### 2. Configurar Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuración del Entorno

### Variables de Entorno Backend (.env)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vetcare
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=null
MAIL_FROM_NAME="${APP_NAME}"
```

### Variables de Entorno Frontend (.env)
```env
VITE_API_URL=https://vetcareclinica.com
VITE_APP_NAME=VetCare
```

## 🧪 Testing

### Backend
```bash
cd backend
php artisan test
```

### Frontend
```bash
cd frontend
npm run test
```

## 📚 Documentación

- [Documentación de la API](docs/api.md)
- [Guía de Contribución](CONTRIBUTING.md)
- [Guía de Despliegue](docs/deployment.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo Inicial* - [TuUsuario](https://github.com/TuUsuario)

## 🙏 Agradecimientos

- [Laravel](https://laravel.com)
- [React](https://reactjs.org)
- [TailwindCSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

---

⭐️ Si te gusta este proyecto, por favor dale una estrella en GitHub.
