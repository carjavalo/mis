# MIS - Sistema de Gestión de Información (Banco de Sangre HUV)

Este proyecto es una plataforma integral monolítica híbrida desarrollada para la gestión eficiente de documentos, formularios dinámicos y usuarios del Banco de Sangre del Hospital Universitario del Valle. Combina la robustez de **Laravel 11** en el backend con la interactividad de una Single Page Application (SPA) construida en **React** dentro del mismo repositorio.

## 🚀 Tecnologías Principales

### Backend

-   **Framework:** Laravel 11.x
-   **Lenguaje:** PHP 8.2+
-   **Base de Datos:** MySQL
-   **Autenticación:** Laravel Sanctum (Token-based)
-   **API:** RESTful API Design

### Frontend

-   **Framework:** React 18
-   **Lenguaje:** TypeScript (TSX)
-   **Build Tool:** Vite
-   **Estilos:** Tailwind CSS
-   **Router:** React Router DOM
-   **Iconos:** Lucide React

---

## 🏛️ Arquitectura y Módulos

El sistema está diseñado con una arquitectura modular basada en roles (RBAC):

### 1. 🛡️ Módulo de Administración (`/dashboard-admin`)

Dirigido a los administradores del sistema.

-   **Gestión de Usuarios:** Creación, edición y asignación de roles (User, Admin, Editor).
-   **Constructor de Formularios:** Interfaz visual ("Drag & Drop" logic) para crear tablas de base de datos dinámicas.
-   **Gestión de Permisos:** Asignación granular de permisos a usuarios sobre documentos específicos (Ver, Editar, Eliminar).
-   **Gestión de Registros:** Visualización y administración de toda la data recolectada.

### 2. 👤 Módulo de Usuario (`/dashboard-users`)

Dirigido al personal operativo.

-   **Mis Documentos:** Vista filtrada que muestra solo los documentos asignados al usuario.
-   **Gestión de Registros:** Interfaz simplificada para diligenciar formularios y consultar registros previos, respetando estrictamente los permisos asignados (`can_view`, `can_edit`, `can_delete`).

### 3. 👁️ Módulo de Auditoría / Super Admin

Dirigido a auditores y super-administradores.

-   **Registro de Actividad:** Log detallado de todas las acciones críticas (Creación, Actualización y Eliminación de registros).
-   **Trazabilidad:** Monitoreo de IP, Usuario y Fecha de cada transacción.

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para desplegar el proyecto en un entorno local:

### Prerrequisitos

-   PHP >= 8.2
-   Composer
-   Node.js & NPM
-   MySQL

### Pasos

1. **Clonar el Repositorio**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd Back_MIS_HUV
    ```

2. **Instalar Dependencias Backend**

    ```bash
    composer install
    ```

3. **Instalar Dependencias Frontend**

    ```bash
    npm install
    ```

4. **Configurar Entorno**

    - Copiar el archivo de ejemplo: `cp .env.example .env`
    - Configurar las credenciales de base de datos en `.env`:
        ```env
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=nombre_tuba_db
        DB_USERNAME=tu_usuario
        DB_PASSWORD=tu_password
        ```

5. **Generar Key y Migrar**

    ```bash
    php artisan key:generate
    php artisan migrate
    ```

6. **(Opcional) Crear Datos Semilla o Usuario de Prueba**
    ```bash
    php artisan tinker
    # Dentro de tinker:
    # \App\Models\User::create(['nombre' => 'Admin', 'correo' => 'admin@test.com', 'password' => bcrypt('password'), 'rol' => 'admin']);
    ```

---

## ▶️ Ejecución

Para trabajar en desarrollo, necesitas dos terminales activas:

**Terminal 1 (Backend - Laravel):**

```bash
php artisan serve
```

**Terminal 2 (Frontend - Vite):**

```bash
npm run dev
```

El proyecto estará disponible típicamente en `http://127.0.0.1:8000`.

---

## 📂 Estructura del Proyecto

-   `app/Models`: Modelos Eloquent (User, DynamicForm, ActivityLog).
-   `app/Http/Controllers`: Lógica de negocio y Endpoints de la API.
-   `database/migrations`: Definiciones de esquema de base de datos.
-   `resources/js`: Código fuente del Frontend (React).
    -   `components`: Componentes UI reutilizables.
    -   `modules`: Páginas y lógica específica por módulo (Admin, User).
    -   `lib`: Utilidades y configuración de Axios/Auth.
    -   `providers`: Contextos de React (AuthContext, ToastContext).

---

## 🔒 Seguridad

-   **Rutas Protegidas:** Uso de `ProtectedRoute` en React y Middleware `auth:sanctum` en Laravel.
-   **Validación:** Requests validados en el servidor para garantizar la integridad de los datos.
-   **Sanitización:** Prevención de inyección SQL mediante Eloquent ORM.

---

**Hospital Universitario del Valle - 2024/2026**
