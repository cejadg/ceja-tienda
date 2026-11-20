# Migración de Ceja Tienda a Cloudflare Pages

Esta rama prepara la tienda para Cloudflare Pages sin eliminar ni reemplazar Netlify.

## Qué cambia

- El sitio estático se publica desde `public/`.
- El comando de build es `npm run build`; genera `public/catalogo.json` y `netlify/functions/lib/ready.mjs` a partir del catálogo y las imágenes existentes.
- Las rutas Pages Functions de `functions/api/` reutilizan los handlers actuales de `netlify/functions/`:
  - `POST /api/checkout`
  - `GET /api/entrega`
  - `POST /api/gratis`
  - `GET /api/admin-link`
- Se conserva Mercado Pago Checkout Pro y Cloudflare R2 privado. No se suben secretos al repositorio.

## Configuración del proyecto en Cloudflare

En Workers & Pages, crear un proyecto Pages conectado a este repositorio y seleccionar la rama `migracion-cloudflare-pages` para las primeras pruebas.

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `public`
- Root directory: /
- Production branch: mantener `main` hasta terminar las pruebas. No cambiarla a la rama de migración todavía.

El archivo `wrangler.toml` declara la carpeta de salida y la compatibilidad Node necesaria para los módulos `node:crypto` y `process.env` usados por los handlers existentes.

## Variables y secretos

Cargar en Settings → Variables and Secrets del proyecto Pages. Configurarlos en Production y Preview cuando corresponda:

| Nombre | Tipo | Valor |
|---|---|---|
| `MP_ACCESS_TOKEN` | Secret | Access Token de Mercado Pago. Empezar con credenciales de prueba. |
| `ORDER_SECRET` | Secret | La misma clave de 40 caracteres que usa actualmente Netlify. No regenerarla durante la migración. |
| `ADMIN_KEY` | Secret | La misma clave administrativa actual. |
| `S3_ACCESS_KEY_ID` | Secret/variable sensible | Access Key ID de R2. |
| `S3_SECRET_ACCESS_KEY` | Secret | Secret Access Key de R2. |
| `S3_ENDPOINT` | Variable | Endpoint S3 de la cuenta R2. |
| `S3_BUCKET` | Variable | Nombre del bucket privado. |
| `S3_REGION` | Variable opcional | `auto` para R2. |
| `SITE_URL` | Variable | URL de Pages, sin barra final. |
| `MP_USE_SANDBOX` | Variable opcional | `1` solo si se necesita el sandbox de MP. |

No copiar los valores secretos a GitHub, al archivo Wrangler ni al frontend. Mantener los valores actuales de Netlify hasta verificar Pages.

## Pruebas antes de cambiar el dominio

1. Confirmar que el deploy termina y que la tienda carga imágenes y catálogo completo.
2. Probar búsqueda, modal, carrito y descuentos.
3. Con credenciales de prueba de Mercado Pago, completar compras individuales y con carrito.
4. Comprobar estados pendiente, aprobado y rechazado en `gracias.html`.
5. Confirmar que cada compra aprobada entrega todos los archivos desde el bucket privado R2 y que los enlaces caducan.
6. Probar el producto gratis y la recuperación administrativa de enlaces.
7. Ejecutar `npm test` localmente o en CI.

No cambiar DNS ni desconectar Netlify hasta completar todas las pruebas. Si algo falla, la tienda actual sigue disponible en Netlify.

## Nota

El repositorio incluye imágenes y catálogo dinámico generado durante el build. El archivo `netlify.toml` se conserva para no afectar el sitio existente en Netlify; Cloudflare Pages usa la configuración indicada en el panel y en `wrangler.toml`.
