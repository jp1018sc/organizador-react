# Plan Fest — versión React

Organizador de eventos migrado de JavaScript a React (con Vite).

## Cómo correrlo

1. Tener instalado [Node.js](https://nodejs.org) (versión 18 o más nueva).
2. Abrir una terminal dentro de esta carpeta (`organizador-react`).
3. Instalar las dependencias (solo la primera vez):

   ```
   npm install
   ```

4. Iniciar el servidor de desarrollo:

   ```
   npm run dev
   ```

5. Abrir en el navegador la dirección que aparece (normalmente http://localhost:5173).

Para generar la versión final (carpeta `dist`): `npm run build`.

## Estructura

```
organizador-react/
├── index.html          → solo tiene el <div id="root"> donde React dibuja la app
├── public/img/         → imágenes
└── src/
    ├── main.jsx        → arranca la app
    ├── App.jsx         → encabezado, portada y pie de página
    ├── organizador.jsx → formulario, lista de eventos, buscador y ordenar
    └── estilo.css      → el mismo CSS del proyecto original
```

## Qué cambió respecto al JavaScript original

| Antes (JS)                                   | Ahora (React)                                       |
|----------------------------------------------|-----------------------------------------------------|
| `const eventos = []` y `eventos.push(...)`   | `useState([])` y `setEventos([...eventos, nuevo])`  |
| `document.querySelector(...)`                | Cada input tiene `value` y `onChange` con su estado |
| `addEventListener('click', ...)`             | `onClick={...}`, `onSubmit={...}`, `onChange={...}` |
| `mostrarEventos()` borra y redibuja la lista | React redibuja solo cuando cambia el estado         |
| `classList.add('realizado')`                 | `className={evento.realizado ? '...' : '...'}`      |
| Eliminar por índice (`splice`)               | Eliminar por `id` (`filter`)                        |
