# Mini Issue Tracker

Aplicación para la gestión de proyectos e incidencias (issues/tickets) al estilo Jira.  
Backend en Node.js + Express y frontend en Flutter Web.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) instalado
- [Flutter](https://flutter.dev/) instalado y configurado

---

## Instalación y ejecución

Este proyecto tiene **dos partes** que deben correr al mismo tiempo, cada una en su propia terminal.

### Terminal 1 — Backend (API REST)

```bash
cd Mini-Issue-Tracker-main
npm install
npm start
```

El servidor quedará corriendo en `http://localhost:3000` (solo API, no abre página web).

---

### Terminal 2 — Frontend Flutter

```bash
cd frontend_flutter
flutter pub get
flutter run -d web-server --web-port 9000
```

---

## Acceso

Una vez que ambas terminales estén corriendo, abrí tu navegador y entrá a:

```
http://localhost:9000
```

Ahí verás la interfaz de la aplicación. El frontend se comunica automáticamente con el backend en el puerto 3000.

---

## Estructura del proyecto

```
Mini-Issue-Tracker-cambios-grandes/
├── Mini-Issue-Tracker-main/   → Backend Node.js (API REST, puerto 3000)
└── frontend_flutter/          → Frontend Flutter Web (puerto 9000)
```
