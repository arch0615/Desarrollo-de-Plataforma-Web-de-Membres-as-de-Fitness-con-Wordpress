# UAT Checklist — Milagros Fitness

**Para:** Milagros
**Cuándo:** Cuando puedas dedicarle 60–90 min, idealmente con tu celu y tu compu al lado.
**Cómo usarlo:** marcá cada ítem ✅ si funciona, ❌ con una nota si algo no anda. Mandame los ❌ y los resuelvo.

---

## Antes de empezar

- URL del sitio: `http://157.230.236.44:3000` (cambia cuando enganchemos el dominio)
- Cuenta admin: `admin@milagros.local` / `admin1234` — cambiá la contraseña en /perfil después
- Cuenta de prueba (miembro): `test-member@milagros.local` / `test1234`

> Antes de pasar a producción se cambian estas claves y se borra `test-member`.

---

## A. Sitio público (10 ítems)

- [ ] **A1.** La home (`/`) carga en menos de 3 segundos en 4G
- [ ] **A2.** Los botones se ven y son clickeables en celular sin solaparse
- [ ] **A3.** El acordeón de FAQ abre y cierra
- [ ] **A4.** "Elegir Mensual" en `/membresia` lleva a `/registro?plan=mensual` cuando estoy desloguead@
- [ ] **A5.** Los links del footer (Términos, Privacidad, Contacto) funcionan
- [ ] **A6.** El texto en español se lee natural — sin traducciones raras
- [ ] **A7.** Los precios y períodos de los planes son los que esperamos
- [ ] **A8.** Una página inexistente (ej `/xyz`) muestra el 404 con marca
- [ ] **A9.** El banner de cookies aparece en la primera visita y se cierra al aceptar
- [ ] **A10.** El logo y los colores de marca se ven bien

---

## B. Auth (8 ítems)

- [ ] **B1.** Crear cuenta con un email nuevo recibe email de verificación en menos de 1 min
- [ ] **B2.** Intentar crear cuenta con el mismo email muestra un error claro
- [ ] **B3.** Click en el link del email verifica la cuenta
- [ ] **B4.** Login con la contraseña correcta entra a `/app` (o `/membresia` si no hay sub)
- [ ] **B5.** Login con contraseña errónea muestra error sin trabar la cuenta
- [ ] **B6.** "Olvidé mi contraseña" envía link, el reset funciona
- [ ] **B7.** Cerrar sesión y querer entrar a `/app` redirige al login
- [ ] **B8.** Si la cuenta no está verificada, el login muestra el aviso correcto

---

## C. Suscripción + acceso (6 ítems)

> **MP todavía no está conectado.** Estos pasos los corrés con la opción "otorgar acceso manual" desde /admin/miembros mientras tanto. Cuando MP esté listo, repetimos esta sección con tarjetas reales.

- [ ] **C1.** Otorgar acceso manual a `test-member@milagros.local` desde el panel
- [ ] **C2.** Loguearse como ese miembro abre el dashboard `/app` con clases
- [ ] **C3.** En `/app/suscripcion` se ve el plan correcto y la fecha de fin
- [ ] **C4.** Cancelar la suscripción muestra "Tu acceso continúa hasta DD/MM"
- [ ] **C5.** La cancelación deja al miembro con acceso hasta el fin del período (no lo echa)
- [ ] **C6.** Sin suscripción activa, ir a `/app` redirige a `/membresia?reason=no-sub` con un banner amarillo

---

## D. Experiencia de miembro (10 ítems)

- [ ] **D1.** El dashboard muestra "Continuar viendo" si hay clases empezadas
- [ ] **D2.** Buscar "fuerza" en `/app/clases` devuelve clases de fuerza
- [ ] **D3.** El filtro "Principiante" muestra solo clases de ese nivel
- [ ] **D4.** El filtro de duración (Corta/Media/Larga) funciona
- [ ] **D5.** Tocar una clase abre el detalle y el reproductor (o el placeholder si todavía no hay video)
- [ ] **D6.** El corazón guarda y saca de favoritos con un toast claro
- [ ] **D7.** En `/app/favoritos` aparecen las que marcaste
- [ ] **D8.** Crear una lista, agregarle 2 clases, reordenar y borrar funciona
- [ ] **D9.** En `/app/perfil` se puede cambiar el nombre y la contraseña (se valida la actual)
- [ ] **D10.** En el celu en horizontal el reproductor se ve bien (cuando haya video)

---

## E. Admin (10 ítems)

- [ ] **E1.** Login en `/admin` funciona con el usuario admin
- [ ] **E2.** El dashboard muestra: miembros con acceso, MRR, signups 7d/30d, pagos pendientes
- [ ] **E3.** Crear una categoría nueva en `/admin/categorias`
- [ ] **E4.** Crear una clase nueva: título + categoría → me lleva al editor
- [ ] **E5.** Editar título / descripción / nivel / equipo de una clase y guardar
- [ ] **E6.** Subir un video real a una clase (esto activa cuando enganchemos Bunny)
- [ ] **E7.** Publicar la clase, verla en el listado público de la biblioteca
- [ ] **E8.** Buscar miembro por email, otorgar acceso manual, verificar que entra
- [ ] **E9.** Extender período +30 días → la fecha de fin avanza correctamente
- [ ] **E10.** Marcar un pago pendiente como aprobado → la sub queda activa

---

## F. Configuración (3 ítems)

- [ ] **F1.** En `/admin/configuracion` se ve qué está y qué falta configurar (DB, Auth, MP, Bunny, email)
- [ ] **F2.** "Enviar email de prueba" llega a tu casilla (cuando RESEND_API_KEY esté)
- [ ] **F3.** Crear un plan nuevo en `/admin/planes` con un precio diferente

---

## Glosario rápido (por si algo no es obvio)

- **Bunny / Bunny Stream**: el servicio que aloja los videos. Hasta que tengamos cuenta, los videos se ven como "pendientes".
- **MP / Mercado Pago**: el cobro recurrente. Hasta que tengamos credenciales, las suscripciones se activan a mano desde el admin.
- **MRR**: Monthly Recurring Revenue — la suma mensual de las suscripciones activas (los planes anuales se dividen por 12).
- **Sub / suscripción**: el registro que dice "esta usuaria tiene acceso hasta tal fecha".

---

## Si encontrás bugs

Mandame por WhatsApp o email:

1. **Página exacta** (la URL en la barra del navegador)
2. **Pasos** (qué tocaste antes)
3. **Qué esperabas** vs **qué viste**
4. **Captura de pantalla** si podés
5. **Tu dispositivo** (celu/compu, navegador)

Yo los clasifico:
- **P0**: bloquea registro / pago / ver clase → mismo día
- **P1**: rompe una función importante (favoritos, listas, admin) → 24-48h
- **P2**: detalle visual o de UX → próximo sprint
