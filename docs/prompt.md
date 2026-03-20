# Prompt — AgroControl Plátano Hartón

## Prompt original del proyecto

Diseñar y desarrollar una aplicación web completa para la gestión de gastos, progreso y producción de un cultivo de plátano hartón en Granada, Meta (Colombia).

## Decisiones técnicas tomadas y justificación

### Frontend: Vanilla JS con ES Modules
**Por qué:** GitHub Pages no ejecuta servidor, solo archivos estáticos. React/Vue requieren bundler (Vite/Webpack) y paso de build que complica el deploy. Vanilla JS con módulos ES6 permite:
- Deploy directo sin build step
- Zero dependencias en runtime
- Compatible 100% con GitHub Pages
- Bundle implícito del navegador

### Backend: Express + Mongoose
**Por qué:** Stack mínimo y estable, bien conocido, fácil de deployar en Railway/Render gratis. Mongoose agrega validaciones declarativas y ODM sobre MongoDB Atlas.

### Rutas hash (#/ruta)
**Por qué:** GitHub Pages no tiene servidor que reescriba URLs. El hash routing funciona completamente en el cliente sin configuración del servidor.

### Chart.js cargado desde CDN
**Por qué:** No tiene sentido bundlearlo. Se carga solo cuando el usuario visita el dashboard y se cachea. Zero impacto en carga inicial.

### Sin Redux/Zustand
**Por qué:** El estado de la app es simple: usuario autenticado + ruta actual. Un módulo State.js con getter/setter es suficiente y sin overhead.

### JWT en localStorage
**Por qué:** GitHub Pages es HTTPS. El riesgo de XSS es mitigado por no tener innerHTML con datos del servidor sin sanitizar. Para esta escala (1-2 usuarios) es apropiado.
