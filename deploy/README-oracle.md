# Deploy the SCIM stack on an Oracle Cloud "Always Free" VM

Goal: run the whole stack (Postgres + Keycloak + SCIM app + edge-proxy + ngrok)
on a free, always-on VM so Okta / Runscope can reach it at your public HTTPS
domain **without your laptop running**.

Everything the app needs is containerized in
[`docker-compose.prod.yml`](../docker-compose.prod.yml). Because Docker starts on
boot and every service uses `restart: unless-stopped`, the stack comes back by
itself after a reboot — no systemd unit to maintain.

> **Why Oracle "Always Free"?** The Ampere A1 shape is free *forever* (not a
> 12-month trial) and gives enough RAM for Keycloak. A card is required at signup
> for identity verification only — Always Free resources are not charged.

---

## 1. Create the Oracle Cloud account

1. Go to <https://www.oracle.com/cloud/free/> → **Start for free**.
2. Sign up (email, phone, and a card for verification). Pick a **Home Region**
   close to you — note it, your VM lives there.
3. Wait for the account to finish provisioning (you land in the OCI Console).

## 2. Create the Always Free VM

1. Console → **Menu ☰ → Compute → Instances → Create instance**.
2. **Name:** `scim-server`.
3. **Image and shape → Edit:**
   - Image: **Canonical Ubuntu 24.04** (or 22.04).
   - Shape: **Ampere → VM.Standard.A1.Flex**. Set **1 OCPU / 6 GB** (well within
     the Always-Free allowance and plenty for this stack). Make sure the shape
     shows the green **"Always Free-eligible"** tag.
     - *If A1 capacity is unavailable in your region*, use **VM.Standard.E2.1.Micro**
       (AMD, also Always Free, 1 GB RAM) — it works but is tight; see the
       low-memory note at the bottom.
4. **Networking:** keep the default VCN/subnet, **Assign a public IPv4 address = Yes**.
5. **SSH keys:** choose **Generate a key pair for me** and **download the private
   key** (or paste your own public key). Keep the private key safe.
6. **Create.** When the instance is **Running**, copy its **Public IP address**.

We use ngrok (an *outbound* tunnel), so you do **not** need to open any inbound
ports beyond SSH (22), which is open by default. Nothing else to configure in
Security Lists.

## 3. Connect and install Docker

SSH in (default user on Ubuntu images is `ubuntu`):

```bash
chmod 600 /path/to/your-private-key.key
ssh -i /path/to/your-private-key.key ubuntu@<PUBLIC_IP>
```

Install Docker Engine + the compose plugin, then allow your user to run docker:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
sudo systemctl enable --now docker   # start on boot + now
newgrp docker                        # apply the group without re-login
docker version                       # sanity check
```

## 4. Get the code onto the VM

**Option A — GitHub (recommended).** Push this repo to a GitHub repo you control,
then on the VM:

```bash
git clone https://github.com/<you>/okta-scim-server.git
cd okta-scim-server
```

**Option B — copy from your laptop** (no GitHub). From your Windows machine:

```bash
scp -i /path/to/key.key -r ./okta-scim-server ubuntu@<PUBLIC_IP>:~/
```

> Do **not** copy your local `.env` / `node_modules` / `dist` — the build creates
> fresh ones. (`.dockerignore` already excludes them from the image.)

## 5. Configure the environment

Create `.env` in the repo root on the VM (compose reads it automatically):

```bash
cp deploy/.env.deploy.example .env
nano .env
```

Set:

- `PUBLIC_BASE_URL` — your reserved ngrok domain, e.g.
  `https://excluding-snowdrift-reformer.ngrok-free.dev`
- `PUBLIC_HOST` — the same domain **without** `https://`
- `NGROK_AUTHTOKEN` — the authtoken of the ngrok account that **owns** that
  reserved domain (dashboard → *Your Authtoken*)
- `DEMO_CLIENT_SECRET` — leave the demo value unless you changed the realm

> ⚠️ **One agent per reserved domain.** ngrok only lets one tunnel serve a given
> domain at a time. **Stop the tunnel on your laptop** (`npm run demo:stop`)
> before starting it on the VM, or the VM's ngrok will fail to bind the domain.

## 6. Bring the stack up

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

First run builds the app image (a few minutes on 1 OCPU) and pulls Postgres,
Keycloak, and ngrok. Keycloak takes ~30–60s to import the realm on first boot.

## 7. Verify

```bash
# containers should all be "Up"
docker compose -f docker-compose.prod.yml ps

# local checks from inside the VM
curl -s -o /dev/null -w "kc      %{http_code}\n" http://localhost:8080/realms/scim/.well-known/openid-configuration 2>/dev/null || true

# public checks (works from anywhere) — discovery is 200, unauth Users is 401
curl -s -o /dev/null -w "spconf  %{http_code}\n" https://<YOUR_DOMAIN>/scim/v2/ServiceProviderConfig
curl -s -o /dev/null -w "noauth  %{http_code}\n" https://<YOUR_DOMAIN>/scim/v2/Users   # expect 401

# full auth chain: get a token from Keycloak, call SCIM with it (expect 200)
TOKEN=$(curl -s -X POST https://<YOUR_DOMAIN>/realms/scim/protocol/openid-connect/token \
  -d grant_type=client_credentials -d client_id=scim-client \
  -d client_secret=w_ZeIPDTrGvDwE9sb0fWQPXV-AZqmU-7 -d scope=scim \
  | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
curl -s -o /dev/null -w "auth    %{http_code}\n" -H "Authorization: Bearer $TOKEN" \
  https://<YOUR_DOMAIN>/scim/v2/Users
```

Then open `https://<YOUR_DOMAIN>/demo` in a browser (click through ngrok's
one-time warning page). Your Okta SCIM base URL stays
`https://<YOUR_DOMAIN>/scim/v2` — nothing in Okta changes.

## 8. Always-on / reboot behavior

Already handled:
- `sudo systemctl enable docker` → Docker starts on boot.
- `restart: unless-stopped` on every service → containers restart on crash and
  after reboot.

Test it: `sudo reboot`, wait ~1 min, SSH back in, and
`docker compose -f docker-compose.prod.yml ps` should show everything `Up` again.

## Day-2 operations

```bash
# view logs (all, or one service)
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f app

# redeploy after pulling new code
git pull
docker compose -f docker-compose.prod.yml up -d --build

# stop everything (frees the ngrok domain)
docker compose -f docker-compose.prod.yml down

# stop but keep the database volume (default) vs wipe it
docker compose -f docker-compose.prod.yml down            # keeps data
docker compose -f docker-compose.prod.yml down -v          # deletes Postgres data
```

## Low-memory note (E2.1.Micro / 1 GB only)

Keycloak + Postgres + Node on 1 GB is tight. Add swap so it doesn't OOM:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Prefer the Ampere A1 shape (6 GB) if it's available — no swap needed.

---

# Alternative: real domain + Caddy TLS (no ngrok)

If you'd rather own the URL and drop the ngrok dependency, use
[`docker-compose.caddy.yml`](../docker-compose.caddy.yml) instead. It runs the
same app-side services but replaces the ngrok tunnel with **Caddy**, which
terminates HTTPS on ports 80/443 with **automatic Let's Encrypt certificates**
and forwards to the edge-proxy (so the `/demo` capture still works):

```
Internet ──443/TLS──▶ Caddy ──▶ edge-proxy:8088 ──▶ app:3000 / keycloak:8080
```

Trade-off vs ngrok: you get a stable, self-owned HTTPS URL and no third-party
tunnel, but you must own/point a domain and open inbound ports 80 + 443.

### 1. Claim the free DuckDNS domain (`hash8-auth.duckdns.org`)

1. Go to <https://www.duckdns.org> and sign in (Google/GitHub/etc.).
2. In the **domains** box type `hash8-auth` and **add domain** →
   `hash8-auth.duckdns.org` is now yours.
3. Copy the **token** shown at the top of the page — you'll put it in `.env` as
   `DUCKDNS_TOKEN`.
4. Set its **current ip** to the VM's public IP (paste the IP and click *update
   ip*). You only need to do this once by hand — the `duckdns` container in
   `docker-compose.caddy.yml` then keeps it current automatically from then on,
   even if the VM's IP changes.

Verify it resolves before continuing: `dig +short hash8-auth.duckdns.org` (or
`nslookup hash8-auth.duckdns.org`) should return the VM IP.

> Own a real domain instead? Just point an **A record** at the VM IP, set
> `PUBLIC_BASE_URL`/`PUBLIC_HOST` to it, and you can delete the `duckdns` service
> from the compose file (it's DuckDNS-specific).

### 2. Open ports 80 and 443 (two layers)

**a) OCI Security List** — Console → your VM → **Virtual Cloud Network** →
**Security Lists** → default list → **Add Ingress Rules**:

| Source CIDR | IP Protocol | Destination Port |
|---|---|---|
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |

**b) VM firewall** — Oracle's Ubuntu images ship an iptables rule that rejects
inbound traffic, so also run on the VM:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo apt-get install -y iptables-persistent   # prompts to save current rules
sudo netfilter-persistent save
```

### 3. Configure `.env` (no ngrok token needed)

```bash
cp deploy/.env.deploy.example .env
nano .env
```

The example is already pre-set to `hash8-auth.duckdns.org` — you only need to
paste your DuckDNS token:

```
PUBLIC_BASE_URL=https://hash8-auth.duckdns.org
PUBLIC_HOST=hash8-auth.duckdns.org
DUCKDNS_SUBDOMAIN=hash8-auth
DUCKDNS_TOKEN=<paste-your-duckdns-token>
DEMO_CLIENT_SECRET=w_ZeIPDTrGvDwE9sb0fWQPXV-AZqmU-7
```

### 4. Bring it up

```bash
docker compose -f docker-compose.caddy.yml up -d --build
```

On first start Caddy performs the ACME HTTP-01 challenge (needs port 80 reachable
and DNS resolving) and installs the certificate. Watch it happen:

```bash
docker compose -f docker-compose.caddy.yml logs -f caddy
# look for: "certificate obtained successfully"
```

### 5. Verify

Same checks as §7 above, using your real domain — no ngrok warning page to click
through this time:

```bash
curl -s -o /dev/null -w "spconf %{http_code}\n" https://hash8-auth.duckdns.org/scim/v2/ServiceProviderConfig
curl -s -o /dev/null -w "noauth %{http_code}\n" https://hash8-auth.duckdns.org/scim/v2/Users   # 401
```

Your Okta **SCIM base URL** becomes `https://hash8-auth.duckdns.org/scim/v2`, and the
OAuth endpoints point at `https://hash8-auth.duckdns.org/realms/scim/...`.

> **Certs survive restarts.** Issued certificates live in the `caddy_data`
> volume, so reboots and redeploys don't re-hit Let's Encrypt (which has rate
> limits). Don't run `down -v` unless you intend to discard them.

All the day-2 commands from above work the same — just swap
`-f docker-compose.prod.yml` for `-f docker-compose.caddy.yml`.
