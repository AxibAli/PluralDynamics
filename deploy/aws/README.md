# Deploying to AWS (EC2)

The whole site is **one Node.js app** (`npm run build` → `.output/`, started with `npm start`):
pages, the `/admin` dashboard, the JSON API and image uploads. It runs under PM2 behind Nginx.

- **Data**: MongoDB Atlas (blogs, products, images, contact messages) via `MONGODB_URI`.
- **Contact emails**: nodemailer through `smtp.pluraldynamics.com` (the `contact@pluraldynamics.com` mailbox).
- **Settings**: `/opt/pluraldynamics/.env` (see `.env.example`).

## 1. Launch the server

AWS Console → EC2 → **Launch instance**

| Setting | Value |
|---|---|
| Image | Ubuntu Server 24.04 LTS |
| Type | `t3.small` recommended (`t3.micro` works; the script adds 2 GB swap for the build) |
| Key pair | create one and keep the `.pem` file |
| Storage | 20 GB |
| Security group | allow **SSH 22** (My IP), **HTTP 80** and **HTTPS 443** (Anywhere) |

Then EC2 → **Elastic IPs** → Allocate → Associate with the instance, so the IP never changes.

## 2. Allow the server in MongoDB Atlas

Atlas → **Security → Network Access → Add IP Address** → the Elastic IP. Without this the site
falls back to the original content and the dashboard can't save (`SSL alert number 80` in the logs).

## 3. Point the domain

In the DNS zone of pluraldynamics.com, set **A records** to the Elastic IP:

| Name | Type | Value |
|---|---|---|
| `@` | A | Elastic IP |
| `www` | A | Elastic IP |

**Do not change the MX records or nameservers** — email (contact@, hr@ …) stays with the current host.

## 4. Upload the project and its settings

From the project folder on Windows (PowerShell):

```powershell
tar -czf pluraldynamics.tgz --exclude=node_modules --exclude=.output --exclude=dist --exclude=data --exclude=.env *
scp -i path\to\key.pem pluraldynamics.tgz ubuntu@ELASTIC_IP:~
scp -i path\to\key.pem .env ubuntu@ELASTIC_IP:~/pd.env
```

On the server (`ssh -i path\to\key.pem ubuntu@ELASTIC_IP`):

```bash
sudo mkdir -p /opt/pluraldynamics
sudo tar -xzf ~/pluraldynamics.tgz -C /opt/pluraldynamics
sudo mv ~/pd.env /opt/pluraldynamics/.env
```

Make sure `.env` has `MONGODB_URI`, `ADMIN_PASSWORD` and `SMTP_PASS` (the contact@ mailbox password).

## 5. Run the setup

```bash
sudo bash /opt/pluraldynamics/deploy/aws/setup-server.sh pluraldynamics.com you@example.com
```

The second argument (an email) is only for the free HTTPS certificate; DNS from step 3 must already
point to the server. Then open `https://pluraldynamics.com/admin` and sign in with `ADMIN_PASSWORD`.

## Updating later

Upload the new code (step 4, the `.env` only if it changed) and re-run the setup script.

## Useful commands

```bash
pm2 status                    # is the site running?
pm2 logs pluraldynamics       # logs (database, contact emails, errors)
pm2 restart pluraldynamics    # after editing .env
sudo certbot renew --dry-run  # HTTPS auto-renewal check
```
