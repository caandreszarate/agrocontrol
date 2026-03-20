# Idea — AgroControl Plátano Hartón

## Problema
Un agricultor en Granada, Meta (Colombia) necesita gestionar un cultivo de plátano hartón desde cero.
No existe herramienta adaptada al ciclo agrícola local que permita controlar:
- Gastos por fase del cultivo
- Progreso de cada etapa
- Producción proyectada
- Pagos programados

## Solución
Aplicación web tipo SaaS minimalista que centraliza toda la información del cultivo en un solo lugar, accesible desde móvil y escritorio.

## Usuarios
- **Admin**: propietario del cultivo — control total
- **Viewer**: trabajadores o socios — solo lectura

## Valor diferencial
- Específica para cultivo de plátano hartón (ciclo, fases y terminología locales)
- Sin fricción: formularios rápidos, dashboard visual
- Alertas de pagos próximos
- Proyección de cosecha basada en registros reales

## Ciclo del cultivo (fases reales)
1. Alquiler del terreno
2. Alistamiento del terreno
3. Preabono
4. Siembra
5. Sellado
6. Limpieza de maleza
7. Aplicación de abono

## Restricciones
- Frontend en GitHub Pages (sin servidor propio)
- Backend desacoplado como API REST
- Base de datos MongoDB
