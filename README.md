# Tienda de Ceja: Mercado Pago con entrega automática

Esta carpeta es tu tienda completa. El cliente elige un póster, paga con Mercado Pago, vuelve a tu página y descarga el archivo. Todo sin Payhip.

## Cómo funciona

1. El cliente toca **Comprar** y se abre una ventana con el póster y el precio.
2. Toca **Pagar con Mercado Pago**. Tu servidor crea el cobro con el precio que figura en `catalog.mjs` (el navegador nunca decide cuánto se cobra) y lo manda a Mercado Pago.
3. Cuando paga, Mercado Pago lo devuelve a `gracias.html`. Esa página le pregunta a tu servidor si el pago está aprobado. El servidor **se lo pregunta a Mercado Pago**, no confía en lo que diga el navegador.
4. Si está aprobado, aparecen los botones de descarga. Los archivos están en un almacenamiento privado y los links duran 1 hora; cada vez que se abre la página se generan links nuevos.

Piezas: **Netlify** (la página y las funciones), **Mercado Pago** (el cobro) y **Cloudflare R2** (los archivos privados).

Costos: Netlify y R2 tienen planes gratuitos suficientes para empezar (revisá los límites vigentes en cada sitio). Mercado Pago cobra una comisión por cada venta; está en tu cuenta de Mercado Pago.

## Qué necesitás antes de empezar

- Una cuenta de **Mercado Pago** de vendedor (la tuya).
- Una cuenta gratuita en **GitHub** (github.com), en **Netlify** (netlify.com) y en **Cloudflare** (cloudflare.com).
- Los **10 archivos finales** (los JPG CMYK A3 a 300 DPI y el ZIP del pack).

Los nombres exactos de los menús de cada sitio pueden cambiar con el tiempo. Si algo no aparece donde digo, buscá la opción con un nombre parecido.

---

## Paso 1. Mercado Pago: sacar tus credenciales

1. Entrá a tu cuenta de Mercado Pago y abrí el panel de desarrolladores (`mercadopago.com.ar/developers`).
2. Creá una **aplicación** para pagos online, con la opción **Checkout Pro**.
3. Dentro de la aplicación buscá **Credenciales**. Vas a ver dos juegos: **de prueba** y **de producción**.
4. Copiá el **Access Token de prueba** (empieza con `TEST-`). Lo vas a usar primero para probar sin plata real. Más adelante vas a cambiarlo por el de producción.

No compartas el Access Token con nadie ni lo pongas en el código. Se carga solo en Netlify (paso 5).

## Paso 2. Cloudflare R2: crear el almacenamiento privado

1. En Cloudflare, abrí **R2** y creá un **bucket** (por ejemplo `ceja-archivos`). Dejalo **privado**: no actives ningún acceso público.
2. Anotá tu **Account ID** de Cloudflare. Tu dirección de almacenamiento (endpoint) es:
   `https://TU_ACCOUNT_ID.r2.cloudflarestorage.com`
3. Creá una credencial de acceso (**API token** de R2) con permiso de solo lectura de ese bucket, y anotá el **Access Key ID** y el **Secret Access Key**. El secreto se muestra una sola vez.

Cloudflare puede pedirte cargar un medio de pago para habilitar R2, aunque no se cobre dentro del uso gratuito. Si no querés hacerlo, Backblaze B2 funciona igual con las mismas variables (con su dirección S3 y su región).

## Paso 3. Subir tus archivos al bucket

En el panel de R2, entrá al bucket y subí cada archivo **con esta ruta exacta**. Podés crear las carpetas `posters` y `packs` y subir adentro.

| Producto | Ruta en el bucket | Precio |
|---|---|---|
| Mint Jams | `posters/mint-jams.jpg` | ARS 5.000 |
| Fallen Angels | `posters/fallen-angels.jpg` | ARS 5.000 |
| La Odisea | `posters/la-odisea.jpg` | ARS 5.000 |
| First Light | `posters/first-light.jpg` | ARS 5.000 |
| Rodrigo Bueno | `posters/rodrigo-bueno.jpg` | ARS 5.000 |
| Bocanada | `posters/bocanada.jpg` | ARS 5.000 |
| Mellon Collie | `posters/mellon-collie.jpg` | ARS 5.000 |
| Abbey Road | `posters/abbey-road.jpg` | ARS 5.000 |
| Fight Club Pack | `packs/fight-club-pack.zip` | ARS 10.000 |
| Gracias Indio | `posters/gracias-indio.jpg` | Gratis |

Si querés usar otros nombres, cambialos en `netlify/functions/lib/catalog.mjs` (campo `key`).

## Paso 4. Subir esta carpeta a GitHub

1. En GitHub creá un repositorio nuevo (por ejemplo `ceja-tienda`), **privado**.
2. Elegí **uploading an existing file** y arrastrá **todo el contenido** de esta carpeta (los archivos `netlify.toml`, `package.json`, y las carpetas `public`, `netlify`, `tests`). Tiene que mantenerse la estructura de carpetas.
3. Confirmá con **Commit changes**.

## Paso 5. Netlify: publicar y cargar las variables

1. En Netlify elegí **Add new project → Import an existing project** y conectá tu GitHub. Elegí el repositorio.
2. La configuración sale sola de `netlify.toml` (publica la carpeta `public` y detecta las funciones). Tocá **Deploy**.
3. Cuando termine, abrí **Site configuration → Environment variables** y agregá estas variables (nombre exacto, mayúsculas):

| Variable | Qué poner |
|---|---|
| `MP_ACCESS_TOKEN` | El Access Token de Mercado Pago (primero el `TEST-`) |
| `ORDER_SECRET` | Una clave larga inventada por vos (40 caracteres al azar). Firma los links de descarga. No la cambies después: invalida los links ya entregados |
| `ADMIN_KEY` | Otra clave larga inventada, para recuperar links de clientes (ver más abajo) |
| `SITE_URL` | La dirección de tu página, por ejemplo `https://tu-sitio.netlify.app` (sin barra final) |
| `S3_ENDPOINT` | `https://TU_ACCOUNT_ID.r2.cloudflarestorage.com` |
| `S3_BUCKET` | El nombre de tu bucket, por ejemplo `ceja-archivos` |
| `S3_ACCESS_KEY_ID` | El Access Key ID del paso 2 |
| `S3_SECRET_ACCESS_KEY` | El Secret Access Key del paso 2 |
| `S3_REGION` | Opcional. Si no la ponés se usa `auto`, que es lo que usa R2 |
| `MP_USE_SANDBOX` | Opcional. Poné `1` solo si, al probar con credenciales de prueba, Mercado Pago no abre el pago |

4. Después de cargarlas, hacé un nuevo deploy: **Deploys → Trigger deploy → Deploy site**. Las variables solo se aplican a deploys nuevos.

## Paso 6. Probar sin plata real

1. Abrí tu página, tocá **Comprar** en un póster y **Pagar con Mercado Pago**.
2. Pagá con una **cuenta de prueba** y una **tarjeta de prueba** de Mercado Pago. Las encontrás en la documentación de Mercado Pago, en la sección de pruebas de integración (cuentas de prueba y tarjetas de prueba).
3. Al terminar tenés que volver a tu página y ver el botón **Descargar**. Bajá el archivo y confirmá que es el correcto.
4. Probá también la **descarga gratis** de Gracias Indio y un pago rechazado.

## Paso 7. Pasar a cobrar de verdad

1. En Mercado Pago copiá el **Access Token de producción**.
2. En Netlify reemplazá `MP_ACCESS_TOKEN` por ese valor y borrá `MP_USE_SANDBOX` si la habías puesto.
3. Hacé un nuevo deploy.
4. Pedile a alguien de confianza que compre un póster (no podés pagarte a vos mismo con la misma cuenta). Comprobá que le llegue la descarga. Después podés reembolsarle desde Mercado Pago.

---

## Uso diario

**Cambiar un precio o agregar un póster.** Los precios están en `netlify/functions/lib/catalog.mjs` y también se muestran en la página. Si cambiás el precio en un lugar y no en el otro, el sistema no cobra y avisa que el precio cambió. Lo más fácil es pedírmelo y te devuelvo los dos archivos actualizados.

**Un cliente perdió su link.** En Mercado Pago buscá su pago y copiá la **referencia externa** (algo como `mint.1a2b3c4d5e6f708192`). Abrí en tu navegador:

`https://TU-SITIO/api/admin-link?ref=LA_REFERENCIA&k=TU_ADMIN_KEY`

Te devuelve el link de descarga para reenviárselo.

**Reembolsos.** Si reembolsás un pago en Mercado Pago, el pedido deja de figurar como aprobado y el link deja de entregar archivos nuevos.

**Ver tus ventas.** En tu cuenta de Mercado Pago. Esta tienda no guarda ninguna base de datos propia.

## Seguridad

- Las claves (Mercado Pago, almacenamiento, `ORDER_SECRET`, `ADMIN_KEY`) solo viven en las variables de Netlify. No están en el código ni en GitHub.
- El precio lo decide siempre el servidor.
- Los archivos están en un bucket privado. Nadie puede bajarlos sin un link firmado, y esos links duran 1 hora.
- El link de la página de descarga es personal. Quien lo tenga puede volver a descargar mientras el pago siga aprobado, así que no conviene compartirlo.

## Lo que todavía no hace

- **No envía un mail al comprador.** Depende de que guarde el link de la página de descarga. Mercado Pago le manda su propio comprobante, pero sin el link. Enviar un mail propio es el siguiente paso posible y requiere un dominio propio.
- **Un producto por compra.** No hay carrito.
- **No registra ventas propias.** Los datos están en Mercado Pago.

## Qué se probó y qué no

Probado con simulaciones: el cálculo de precios, la creación del cobro, la verificación del pago (aprobado, pendiente, rechazado, reembolsado, monto incompleto), los links falsos o manipulados, la firma de las descargas (verificada contra el ejemplo oficial de AWS) y todo el recorrido en un navegador. Para correrlas: `npm test` (requiere Node 20 o más).

**No probado:** un pago real contra Mercado Pago, ni la descarga desde tu bucket real, porque eso depende de tus cuentas y claves. Por eso el paso 6 es obligatorio antes de abrir la tienda.


## Tienda completa (76 productos)

- `tienda.html` es la página aparte con todos los pósters y un buscador. El inicio muestra 8 destacados y un botón a la tienda.
- **Agregar un póster a la venta (lo hacés vos):**
  1. Subí el archivo final a R2 con el nombre exacto que figura en `LISTA-DE-ARCHIVOS.md`.
  2. En GitHub, entrá a la carpeta `public/img` > Add file > Upload files, y subí la vista previa con el nombre de la lista (por ejemplo `almendra.jpg`).
  3. Netlify hace el deploy solo y el póster aparece en la Tienda. Se puede subir de a muchos.
- Si borrás la imagen de `public/img`, el póster deja de venderse.
- El inicio (destacados) lo genera mi herramienta; si querés cambiar cuáles son los 8 destacados, pedímelo.

## Carrito y descuento por cantidad

- Cada póster tiene "Agregar al carrito" (y también "Pagar" para comprar solo ese). El carrito está en la barra superior y se guarda en el navegador del cliente.
- Un solo pago en Mercado Pago por todo el carrito. En la página de descarga aparece un botón por cada archivo.
- **Descuentos:** se editan al principio de `netlify/functions/lib/catalog.mjs`, en `DESCUENTOS` (hoy: 2 pósters −10%, 3 −15%, 5 o más −20%). El pack de Fight Club no participa (`SIN_DESCUENTO`). El máximo por compra es `MAX_CARRITO` (12).
- El precio final lo calcula siempre el servidor. Si alguien manipula la página, el cobro se rechaza.
- Si un cliente perdió su link de descarga, `admin-link` sigue sirviendo: ahora también acepta compras con carrito (la referencia empieza con `~`).
