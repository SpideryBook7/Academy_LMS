# 🎓 LMS Pro: Sistema de Gestión de Aprendizaje de Alto Rendimiento

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/stack-React%20%2B%20Vite-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase)
![UI](https://img.shields.io/badge/design-Clean%20Light%20SaaS-3b82f6)

**LMS Pro** es una plataforma moderna, escalable y visualmente impactante diseñada para ofrecer una experiencia educativa de nivel corporativo. Esta versión ha sido optimizada para un despliegue público, ofreciendo una estética **"Clean Light SaaS"** centrada en la legibilidad y el minimalismo profesional.

---

## 📸 Previsualización

|      Acceso al Sistema      |    Dashboard del Estudiante    |          Catálogo de Especialidades           |
| :-------------------------: | :----------------------------: | :-------------------------------------------: |
| ![Login](/public/login.png) | ![Dashboard](/public/dash.png) | ![Especialidades](/public/especialidades.png) |

|        Vista de Curso        |  Gestión de Usuarios (Admin)   |         Calendario Académico          |
| :--------------------------: | :----------------------------: | :-----------------------------------: |
| ![Curso](/public/cursos.png) | ![Usuarios](/public/users.png) | ![Calendario](/public/calendario.png) |

---

## 🚀 Versión Pública (Sanitizada)

Esta edición del sistema ha sido específicamente modificada para su liberación en repositorios públicos. A diferencia de la versión original de producción, se han realizado los siguientes cambios:

- **Sanitización de Identidad:** Se han eliminado todas las referencias a marcas personales, logotipos corporativos específicos y datos de contacto privados.
- **Rediseño Estético:** Evolución de una interfaz oscura a un esquema de colores **"Light SaaS"** (Whites, Slate & Electric Blue) para maximizar la legibilidad en entornos profesionales.
- **Arquitectura Genérica:** Se han neutralizado las rutas y referencias a bases de datos específicas para facilitar la integración con cualquier instancia de Supabase.
- **Optimización de Funcionalidad:** Restauración completa de la lógica de administración y seguimiento de progreso para asegurar un sistema "Plug & Play".

---

## ✨ Características Principales

### 💎 Experiencia de Usuario (UI/UX)

- **Diseño Profesional Moderno:** Interfaz limpia basada en una jerarquía visual clara, tipografía optimizada y sombras suaves.
- **Responsive Design:** Totalmente adaptado para dispositivos móviles y tablets sin sacrificar funcionalidad.
- **Componentes Premium:** Botones, tarjetas y formularios estandarizados bajo un sistema de diseño consistente.

### 📚 Gestión Académica

- **Sistema de Especialidades:** Organización modular de contenidos educativos.
- **Evaluaciones Dinámicas:** Soporte para cuestionarios interactivos (JSON-based) con seguimiento de puntaje.
- **Progreso en Tiempo Real:** Los estudiantes pueden visualizar su avance porcentual y lecciones completadas instantáneamente.

### 🛡️ Seguridad y Administración

- **RBAC (Role Based Access Control):** Paneles diferenciados para estudiantes y administradores.
- **Gestión de Usuarios Admin:** Creación y control de acceso mediante el cliente administrativo de Supabase.
- **Inscripciones Inteligentes:** Sistema para vincular estudiantes a especialidades específicas de forma sencilla.

---

## 🛠️ Stack Tecnológico

- **Frontend:** [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilos:** CSS3 Vanilla (Custom Properties & SaaS Patterns)
- **Backend-as-a-Service:** [Supabase](https://supabase.com/) (PostgreSQL, Auth & Storage)
- **Animaciones:** CSS Transitions & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Iconografía:** Custom SVG & Font-based icons

---

## ⚙️ Instalación Local

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/Open-Academy-LMS.git
   cd Open-Academy-LMS
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Configuración de Variables de Envío:**
   Crea un archivo `.env` en la raíz con lo siguiente:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima
   VITE_SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role
   ```

4. **Ejecutar:**
   ```bash
   npm run dev
   ```

---

## 🛡️ Licencia y Contribuciones

Proyecto bajo licencia **MIT**. Siéntete libre de utilizarlo para tus propios desarrollos educativos. Las contribuciones son bienvenidas para seguir mejorando esta herramienta de acceso abierto.

**Desarrollado por Spiderybook7**
Dar creditos a su creador cristian.huerta.dev@gmail.com

<div align="center">
  <p>Construido para democratizar la gestión educativa con calidad profesional. 🎓</p>
</div>
