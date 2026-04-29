# Operations Runbook — Milagros Fitness

This is the document the on-call (you, James) reads at 02:00 when something breaks. Keep it short, keep it accurate, update it when you change the infra.

---

## 1. Where things live

| Thing | Where |
|---|---|
| App code | `/home/Fitness` |
| Live process | `pnpm start` (or PM2 — see §6 when set up) |
| Database | PostgreSQL 16 on the same VPS, role `milagros`, db `milagros_dev` (rename to `milagros` for prod) |
| DB password | `/root/.fitness-db-creds` (chmod 600) and inside `/home/Fitness/.env` |
| Backups | `/var/backups/milagros/*.sql.gz`, daily 03:00 UTC, 7 retained |
| Backup logs | `/var/log/milagros-backup.log` |
| Cron entry | `/etc/cron.d/milagros-backup` |
| Public IP | `157.230.236.44` (DigitalOcean NYC1) |
| Domain | not provisioned yet |

---

## 2. Required env vars

`/home/Fitness/.env` is gitignored. Every variable below must be set or the app degrades to a documented stub. See `.env.example` in the repo for the canonical list.

### Always required

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. Format: `postgresql://USER:PASS@localhost:5432/DBNAME?schema=public` |
| `AUTH_SECRET` | Auth.js JWT signing secret. Generate: `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | Set to `true` when running behind a reverse proxy (Caddy, nginx) |
| `NEXT_PUBLIC_APP_URL` | Public URL for password-reset / verify links and OG metadata |

### Email (Resend)

| Var | Purpose |
|---|---|
| `RESEND_API_KEY` | If unset, all emails are logged to the server console (verify, reset, admin notifications). Useful in dev; **not OK in prod**. |
| `EMAIL_FROM` | E.g. `Milagros Fitness <noreply@milagros.app>` |

### Mercado Pago

| Var | Purpose |
|---|---|
| `MP_ACCESS_TOKEN` | Production access token from MP panel. Without it the checkout falls back to manual flow. |
| `MP_PUBLIC_KEY` | Public key (reserved for any future client-side SDK use; not currently used) |
| `MP_WEBHOOK_SECRET` | Set in MP panel → Notifications → Webhook signing key. **Required in prod** — without it webhooks are accepted unsigned and a console warning is emitted. |

### Bunny Stream

| Var | Purpose |
|---|---|
| `BUNNY_STREAM_LIBRARY_ID` | From Bunny dashboard → Stream → Library |
| `BUNNY_STREAM_API_KEY` | Library API key |
| `BUNNY_STREAM_CDN_HOSTNAME` | E.g. `vz-xxxxxxx-xxx.b-cdn.net` |
| `BUNNY_STREAM_TOKEN_AUTH_KEY` | Token authentication key, enabled in library settings |
| `BUNNY_WEBHOOK_SECRET` | Webhook secret from library settings |

After changing `.env`, restart the app:

```bash
# during dev (foreground): Ctrl+C and re-run pnpm dev
# in production with PM2:
pm2 restart fitness
```

---

## 3. Daily operations

### 3.1 Add a new class

1. Log in to `/admin` as the admin user
2. Click **Clases → Nueva clase**, fill title + category
3. In the editor, click **Subir video**, drag-drop the `.mp4`. The upload is resumable — closing the tab won't restart it.
4. Bunny transcodes in the background. The class status shows **Procesando** until done (a few minutes per video).
5. Once status flips to **Borrador**, edit metadata (description, level, equipment) and click **Publicar**.

### 3.2 Grant access manually (no MP, gift, transfer)

1. `/admin/miembros` → search by email → click **Ver**
2. Section **Otorgar acceso manual** → choose plan → **Otorgar acceso**
3. Member can log in immediately; period ends in `intervalMonths(plan)` from now

### 3.3 Approve a manual payment

1. Member tells you they paid via transfer
2. `/admin/pagos` → find the pending row → **Aprobar**
3. The linked subscription auto-activates. Audit log records who/what/when.

### 3.4 Extend a member's access

1. `/admin/miembros/[id]` → **Acciones → Extender período**
2. Days are added to the existing period end (or to "now" if expired)

### 3.5 Suspend a member (emergency)

1. `/admin/miembros/[id]` → **Acciones → Suspender acceso**
2. Different from member-initiated cancel: this is **immediate**, no grace period
3. Use for chargebacks, abuse, etc. — not regular cancellations

---

## 4. Backups

### 4.1 What runs and when

`/etc/cron.d/milagros-backup` runs at 03:00 UTC daily as the `postgres` user:

```
0 3 * * * postgres bash /home/Fitness/scripts/backup-db.sh >> /var/log/milagros-backup.log 2>&1
```

The script:
1. `pg_dump` → `gzip` → `/var/backups/milagros/milagros_dev_<UTC stamp>.sql.gz`
2. Verifies gzip integrity (`gzip -t`)
3. Deletes anything older than 7 days

### 4.2 Verify backups are running

```bash
ls -lh /var/backups/milagros/   # expect 1-7 files, newest <26h old
tail -20 /var/log/milagros-backup.log
```

If the newest file is >25h old, something's broken. Check `/var/log/milagros-backup.log` and `journalctl -u cron -n 50`.

### 4.3 Restore drill (DESTRUCTIVE — verify on a non-prod DB first)

```bash
# 1. Pick a backup
BACKUP=$(ls -t /var/backups/milagros/milagros_dev_*.sql.gz | head -1)

# 2. Restore into a fresh test database (does NOT touch prod)
sudo -u postgres dropdb --if-exists milagros_restore_test
sudo -u postgres createdb -O milagros milagros_restore_test
gunzip -c "$BACKUP" | sudo -u postgres psql milagros_restore_test

# 3. Verify counts match expectations
sudo -u postgres psql milagros_restore_test -c \
  'SELECT count(*) FROM "User"; SELECT count(*) FROM "Class";'

# 4. Cleanup
sudo -u postgres dropdb milagros_restore_test
```

### 4.4 Off-VPS sync (Phase 2)

Currently backups live on the same VPS — single point of failure. To add off-VPS:

1. Provision a Backblaze B2 / Cloudflare R2 bucket (~$1/mo for this volume)
2. Append to `scripts/backup-db.sh` after the gzip:
   ```bash
   rclone copy "$OUT" b2:milagros-backups/
   ```
3. Configure `rclone` once with the bucket creds

Not done in v1 to keep zero external dependencies.

---

## 5. External service runbooks

### 5.1 Resend

- Dashboard: https://resend.com/emails
- Test email button: `/admin/configuracion` → **Enviar email de prueba**
- DNS: SPF + DKIM records need to be added when the prod domain lands

### 5.2 Mercado Pago

- Sandbox: https://www.mercadopago.com.ar/developers/panel
- Webhook URL to register: `https://<prod-domain>/api/webhooks/mercadopago`
- Required notification topics: `subscription_preapproval`, `payment`
- Test cards: see https://www.mercadopago.com.ar/developers/en/docs/checkout-pro/additional-content/your-integrations/test/cards

### 5.3 Bunny Stream

- Dashboard: https://dash.bunny.net/
- Webhook URL to register: `https://<prod-domain>/api/webhooks/bunny`
- Token authentication MUST be enabled on the library — without it videos are publicly streamable

---

## 6. Going to production (when domain + creds land)

In order, on the VPS as root:

```bash
# 1. Provision Caddy for TLS + reverse proxy to the Next app
apt-get install -y caddy

# 2. Caddyfile (replace milagros.app with the real domain)
cat > /etc/caddy/Caddyfile <<'EOF'
milagros.app {
  reverse_proxy 127.0.0.1:3000
  encode gzip zstd
}
EOF
systemctl reload caddy

# 3. Process supervision via PM2
npm install -g pm2
cd /home/Fitness
pnpm build
pm2 start "pnpm start" --name fitness
pm2 save
pm2 startup  # follow the printed command to enable on reboot

# 4. Update env vars
nano /home/Fitness/.env
# Set: NEXT_PUBLIC_APP_URL=https://milagros.app
# Set: AUTH_TRUST_HOST=true
# Add: MP_ACCESS_TOKEN=..., MP_WEBHOOK_SECRET=...
# Add: BUNNY_STREAM_*, BUNNY_WEBHOOK_SECRET
# Add: RESEND_API_KEY

pm2 restart fitness

# 5. Firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# 6. Register webhooks
#   MP    panel → notifications → https://milagros.app/api/webhooks/mercadopago
#   Bunny library settings → webhook → https://milagros.app/api/webhooks/bunny

# 7. First real payment test
#   Subscribe with a real card for 1 ARS plan, refund it from MP panel.
#   Confirm webhook arrived (check WebhookEvent rows in DB).
```

---

## 7. Common issues

### "I can't log in"

1. Email verified? → check `User.emailVerifiedAt` in DB
2. Right password? → reset from `/admin/miembros/[id] → Enviar reset de contraseña`
3. Auth.js complaining about `AUTH_TRUST_HOST` → set the env var to `true` when behind a proxy

### "Member paid but doesn't have access"

1. Did the MP webhook fire? Check `WebhookEvent` table for recent `provider='mercadopago'` rows
2. Was it processed? `processedAt` should be non-null. If null, check `error` column.
3. If processing failed, manually approve the payment from `/admin/pagos`

### "Video says 'pending' forever"

1. Bunny webhook configured? Test by uploading a small video and watching `WebhookEvent` rows
2. Check Bunny dashboard → Library → Videos for the actual transcode status
3. If Bunny shows `finished` but our DB doesn't, fire the webhook by hand from Bunny's dashboard

### "Backup didn't run last night"

1. `tail /var/log/milagros-backup.log` — is the cron firing at all?
2. `systemctl status cron` — daemon healthy?
3. `ls -la /etc/cron.d/milagros-backup` — file present?
4. Run manually: `sudo -u postgres bash /home/Fitness/scripts/backup-db.sh`

---

## 8. Phase-2 backlog (out of v1 scope)

These are deliberate cuts from the original 10-day sprint. Each is small enough to ship as a follow-up.

| Item | Effort | Why deferred |
|---|---|---|
| Off-VPS backup sync (rclone → B2/R2) | 2h | Needs bucket creation |
| Avatar upload for /perfil | 4h | Needs Bunny Storage decision |
| HLS.js player (replaces iframe — gives real playback events for accurate progress) | 6h | iframe is good enough for v1 |
| Drag-drop playlist reorder (dnd-kit) | 3h | Up/down arrows ship today |
| Sequential autoplay on "Reproducir todo" | 3h | Needs HLS.js |
| Postgres `tsvector` full-text search (GIN index) | 2h | ILIKE is fine at <100 classes |
| Sentry error tracking | 1h | Need account |
| UptimeRobot uptime monitoring | 30m | Need account |
| Schedule-publish on classes | 2h | Publish-now ships today |
| Bulk admin actions on classes | 2h | Single-row works |
| KPI drill-down drawers on `/admin` | 3h | Static cards ship today |
| English i18n | 8h | Spanish is the audience |
| Live classes / chat | 2 weeks | Phase 2 product |

---

## 9. Useful one-liners

```bash
# Check if dev/prod app is running
ss -tlnp | grep 3000

# Tail the app log (PM2)
pm2 logs fitness --lines 200

# Open the Prisma DB browser locally (dev only)
pnpm db:studio   # exposes :5555 — never on prod

# Force-regenerate Prisma client after schema change
pnpm db:generate

# Apply a new migration (after editing prisma/schema.prisma)
pnpm db:migrate

# Disk usage of backups
du -sh /var/backups/milagros

# Manual backup right now
sudo -u postgres bash /home/Fitness/scripts/backup-db.sh
```

---

## 10. Contacts

- Dev (James) — primary. WhatsApp / email for P0 / P1.
- Mercado Pago support — https://www.mercadopago.com.ar/ayuda
- Bunny support — https://support.bunny.net/
- DigitalOcean support — droplet panel
