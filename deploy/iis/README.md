# Deploying on the AWS Windows Server (IIS)

The site is one Node.js app. On the Windows server it runs as a **Windows service** on
`127.0.0.1:3001`, and **IIS** forwards `staging.pluraldynamics.com` to it (reverse proxy).
Other IIS sites are not affected.

```
C:\inetpub\wwwroot\pluraldynamics\
├── app\            the app: .output\ (the build), .env (settings), logs\
└── site\           IIS site folder: only web.config
```

## One-time server setup (over Remote Desktop)

1. **Node.js 22 LTS**: install from https://nodejs.org (Windows Installer, x64). Open a new PowerShell and check `node -v`.
2. **IIS modules** (skip any already installed):
   - URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite
   - Application Request Routing 3.0: https://www.iis.net/downloads/microsoft/application-request-routing
3. **Turn on the proxy**: IIS Manager → click the *server name* → **Application Request Routing Cache** →
   *Server Proxy Settings* (right side) → tick **Enable proxy** → Apply.
4. **Keep the visitor's host name** (PowerShell as Administrator):
   ```powershell
   & "$env:windir\system32\inetsrv\appcmd.exe" set config -section:system.webServer/proxy /preserveHostHeader:"True" /commit:apphost
   ```
5. **Allow the HTTPS hint header**: IIS Manager → server name → **URL Rewrite** → *View Server Variables…* →
   **Add…** → `HTTP_X_FORWARDED_PROTO`.
6. **NSSM** (runs Node as a service): download from https://nssm.cc/download, copy `win64\nssm.exe` to `C:\tools\nssm\nssm.exe`.

## Deploy / update the site

1. On your PC: `npm run build` (or use the ready-made `pluraldynamics-iis.zip`).
2. Copy to the server:
   - the `.output` folder → `C:\inetpub\wwwroot\pluraldynamics\app\.output` (replace the old one)
   - your `.env` → `C:\inetpub\wwwroot\pluraldynamics\app\.env` (first time, or when it changes)
   - `web.config` → `C:\inetpub\wwwroot\pluraldynamics\web.config`
3. PowerShell **as Administrator**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File C:\inetpub\wwwroot\pluraldynamics\install-service.ps1
   ```
   It creates (or restarts) the `pluraldynamics` service and checks that the app answers.

## IIS site (first time)

IIS Manager → **Sites → Add Website…**

| Field | Value |
|---|---|
| Site name | `pluraldynamics` |
| Physical path | `C:\inetpub\wwwroot\pluraldynamics` |
| Binding | `http`, IP *All Unassigned*, port `80`, Host name `staging.pluraldynamics.com` |

## DNS (at the current domain host)

Add one record — leave MX records and nameservers alone so email keeps working:

| Name | Type | Value |
|---|---|---|
| `staging` | A | the server's public (Elastic) IP |

## HTTPS

Use **win-acme** (https://www.win-acme.com): run `wacs.exe` as Administrator → *N: Create certificate
(default settings)* → pick `staging.pluraldynamics.com`. It adds the https binding and renews automatically.

## Also needed

- **MongoDB Atlas → Network Access**: add the server's public IP.
- **AWS security group** and **Windows Firewall**: inbound 80 and 443 open (usually already, for the other sites).
- `web.config` sends `X-Robots-Tag: noindex` only on `staging.` hosts, so the live domain is indexed.

## Going live on pluraldynamics.com

1. **Write down the current DNS records** for `@`, `www`, `mail`, `smtp` and the **MX** record. If MX points to
   `pluraldynamics.com` itself, first add `mail` → A → *the current (old host) IP* and point MX to
   `mail.pluraldynamics.com`, otherwise email stops when `@` moves. Leave `smtp`/`mail` on the old host.
2. DNS: `@` → A → server Elastic IP; `www` → A → same IP (or CNAME `pluraldynamics.com`). Delete any `AAAA` on `@`/`www`.
   Wait until `nslookup pluraldynamics.com 8.8.8.8` shows the new IP.
3. IIS → site `pluraldynamics` → **Bindings** → add `http` port 80 for `pluraldynamics.com` and `www.pluraldynamics.com`.
4. win-acme: `wacs.exe` → *N* → pick the site → choose `pluraldynamics.com` and `www.pluraldynamics.com`.
5. Copy this `web.config` over the site's one (it adds www → apex and http → https redirects), then `iisreset`.

## When something is wrong

| Symptom | Look at |
|---|---|
| 502.3 / 502 Bad Gateway | the service isn't running: `Get-Service pluraldynamics`, then `app\logs\error.log` |
| IIS 404 or the site never reaches the app | ARR proxy not enabled (step 3), or URL Rewrite missing |
| 500.50 "server variable" error | `HTTP_X_FORWARDED_PROTO` not allowed (step 5) |
| Only 6 short blogs show | MongoDB Atlas doesn't allow the server's IP |
| Contact email not arriving | `SMTP_PASS` in `app\.env`; `[contact]` lines in `app\logs\error.log` |
