"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDemoPage = renderDemoPage;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const val = (v) => `<code class="copy" data-v="${esc(v)}" title="Click to copy">${esc(v)}</code>`;
function renderDemoPage(cfg) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SCIM Provisioning — Live Demo</title>
<style>
  :root {
    --bg: #f4f6fb; --panel: #ffffff; --ink: #12203a; --muted: #5b6b85;
    --line: #e3e8f2; --brand: #1662dd;
    --ok-bg: #e5f6ec; --ok-ink: #1c7a45; --off-bg: #fdeaea; --off-ink: #b3261e;
    --chip: #eef2fb; --chip-ink: #33507f;
    --okta: #1662dd; --keycloak: #7b3ff2; --scim: #12a150;
    --shadow: 0 1px 3px rgba(18,32,58,.08), 0 8px 24px rgba(18,32,58,.06);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0c1120; --panel: #121a2e; --ink: #e8eefb; --muted: #93a1bf;
      --line: #22304d; --brand: #4b8bf5;
      --ok-bg: #123726; --ok-ink: #5fd490; --off-bg: #3a1615; --off-ink: #f19b95;
      --chip: #1b2740; --chip-ink: #a8bce6;
      --okta: #4b8bf5; --keycloak: #a882ff; --scim: #3ddc84;
      --shadow: 0 1px 3px rgba(0,0,0,.4), 0 10px 30px rgba(0,0,0,.35);
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink);
    font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .wrap { max-width: 1400px; margin: 0 auto; padding: 28px 24px 56px; }
  header.top { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .logo { width: 40px; height: 40px; border-radius: 10px; background: var(--brand);
    display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 18px; flex: none; }
  h1 { font-size: 23px; margin: 0; letter-spacing: -.2px; }
  .sub { color: var(--muted); margin: 2px 0 0; }
  .grow { flex: 1; }
  .btn { background: transparent; border: 1px solid var(--line); color: var(--muted); border-radius: 8px;
    padding: 7px 12px; font-size: 13px; cursor: pointer; }
  .btn:hover { color: var(--ink); border-color: var(--muted); }
  .btn.primary { background: var(--brand); color: #fff; border-color: var(--brand); }
  .btn.danger { color: var(--off-ink); border-color: var(--off-ink); }
  .btn.danger:hover { background: var(--off-bg); }

  .layout { display: grid; grid-template-columns: minmax(0,1fr) 420px; gap: 22px; align-items: start; }
  @media (max-width: 1040px) { .layout { grid-template-columns: 1fr; } }

  .card { background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
    padding: 20px 22px; box-shadow: var(--shadow); }
  .card h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin: 0 0 14px; }
  .row2 { display: grid; grid-template-columns: 1.1fr .9fr; gap: 20px; margin-bottom: 20px; }
  @media (max-width: 720px) { .row2 { grid-template-columns: 1fr; } }

  ol.flow { margin: 0; padding-left: 0; list-style: none; counter-reset: step; }
  ol.flow li { position: relative; padding: 0 0 13px 40px; counter-increment: step; }
  ol.flow li:last-child { padding-bottom: 0; }
  ol.flow li::before { content: counter(step); position: absolute; left: 0; top: -1px;
    width: 26px; height: 26px; border-radius: 50%; background: var(--chip); color: var(--chip-ink);
    display: grid; place-items: center; font-weight: 700; font-size: 13px; }
  ol.flow li b { color: var(--ink); }
  ol.flow li span { color: var(--muted); }

  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat { background: var(--bg); border: 1px solid var(--line); border-radius: 12px; padding: 14px; text-align: center; }
  .stat .n { font-size: 28px; font-weight: 700; letter-spacing: -.5px; }
  .stat .l { color: var(--muted); font-size: 12.5px; margin-top: 2px; }

  .section-head { display: flex; align-items: center; justify-content: space-between; margin: 4px 0 12px; }
  .section-head h2 { font-size: 17px; margin: 0; }
  .live { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: 12.5px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: #22c55e; animation: pulse 1.8s infinite; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,.5);} 70% { box-shadow: 0 0 0 8px rgba(34,197,94,0);} 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0);} }

  .tablecard { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); overflow: hidden; }
  .scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 640px; }
  thead th { text-align: left; padding: 12px 16px; color: var(--muted); font-weight: 600; font-size: 11.5px;
    text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid var(--line); }
  tbody td { padding: 13px 16px; border-bottom: 1px solid var(--line); vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr.new { animation: flash 2.4s ease-out; }
  @keyframes flash { from { background: rgba(22,98,221,.16);} to { background: transparent;} }
  .name { font-weight: 600; }
  .email { color: var(--muted); }
  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .badge.on { background: var(--ok-bg); color: var(--ok-ink); }
  .badge.off { background: var(--off-bg); color: var(--off-ink); }
  .badge .d { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .chip { display: inline-block; background: var(--chip); color: var(--chip-ink); border-radius: 6px; padding: 2px 8px; font-size: 12px; margin: 2px 4px 2px 0; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--muted); }
  .empty { padding: 44px 20px; text-align: center; color: var(--muted); }
  .empty .big { font-size: 15px; color: var(--ink); margin-bottom: 4px; font-weight: 600; }
  code { background: var(--chip); color: var(--chip-ink); padding: 1px 6px; border-radius: 5px; font-size: 12.5px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  code.copy { cursor: pointer; border: 1px solid transparent; word-break: break-all; }
  code.copy:hover { border-color: var(--brand); }
  code.copied { background: var(--ok-bg); color: var(--ok-ink); }

  /* ---- setup guide ---- */
  .guide { margin-bottom: 22px; }
  .guide[hidden] { display: none; }
  .step { background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--brand);
    border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; box-shadow: var(--shadow); }
  .step h3 { margin: 0 0 4px; font-size: 15.5px; }
  .step .why { color: var(--muted); font-size: 13px; margin: 0 0 10px; }
  .step .why b { color: var(--ink); }
  .ftable { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .ftable th { text-align: left; color: var(--muted); font-weight: 600; font-size: 11px; text-transform: uppercase;
    letter-spacing: .05em; padding: 6px 10px; border-bottom: 1px solid var(--line); }
  .ftable td { padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  .ftable tr:last-child td { border-bottom: none; }
  .ftable td.f { font-weight: 600; white-space: nowrap; }
  .ftable td.w { color: var(--muted); }
  .pick { display: inline-block; font-weight: 700; border-radius: 5px; padding: 0 6px; font-size: 12px; }
  .pick.on { background: var(--ok-bg); color: var(--ok-ink); }
  .pick.off { background: var(--off-bg); color: var(--off-ink); }
  .note { margin-top: 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--bg); }
  .note > summary { cursor: pointer; padding: 10px 14px; font-weight: 600; font-size: 13.5px; color: var(--brand); list-style: none; }
  .note > summary::-webkit-details-marker { display: none; }
  .note > summary::before { content: '\\25B8  '; color: var(--muted); }
  .note[open] > summary::before { content: '\\25BE  '; }
  .note .body { padding: 2px 14px 12px; font-size: 13px; color: var(--muted); line-height: 1.55; }
  .note .body b { color: var(--ink); }
  .note .body ol { margin: 8px 0 0; padding-left: 18px; }
  .note .body li { margin-bottom: 6px; }
  .note table.mini { width: 100%; border-collapse: collapse; margin: 4px 0 8px; font-size: 12.5px; }
  .note table.mini td { padding: 5px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
  .note table.mini tr:last-child td { border-bottom: none; }
  .note table.mini td:first-child { white-space: nowrap; font-weight: 600; color: var(--ink); }

  /* ---- activity log ---- */
  aside.logpanel { position: sticky; top: 20px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 14px; box-shadow: var(--shadow); display: flex; flex-direction: column; max-height: calc(100vh - 40px); }
  .log-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--line); }
  .log-head h2 { font-size: 15px; margin: 0; }
  .log-head .legend { display: flex; gap: 10px; margin-top: 6px; font-size: 11px; color: var(--muted); }
  .log-head .legend span { display: inline-flex; align-items: center; gap: 5px; }
  .lg { width: 8px; height: 8px; border-radius: 2px; }
  .lg.okta { background: var(--okta); } .lg.keycloak { background: var(--keycloak); } .lg.scim { background: var(--scim); }
  .log { overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
  .log-empty { padding: 40px 16px; text-align: center; color: var(--muted); font-size: 13px; }
  .ev { border: 1px solid var(--line); border-left-width: 4px; border-radius: 10px; padding: 10px 12px; animation: slidein .3s ease-out; }
  @keyframes slidein { from { opacity: 0; transform: translateY(-6px);} to { opacity: 1; transform: none;} }
  .ev.okta { border-left-color: var(--okta); } .ev.keycloak { border-left-color: var(--keycloak); } .ev.scim { border-left-color: var(--scim); }
  .ev-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .actor { font-weight: 700; font-size: 12.5px; }
  .ev.okta .actor { color: var(--okta); } .ev.keycloak .actor { color: var(--keycloak); } .ev.scim .actor { color: var(--scim); }
  .ts { color: var(--muted); font-size: 11px; font-family: ui-monospace, monospace; }
  .ev-line { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; margin: 6px 0 0; word-break: break-all; }
  .st { display: inline-block; font-weight: 700; border-radius: 5px; padding: 0 6px; font-size: 11.5px; margin-right: 6px; }
  .st.ok { background: var(--ok-bg); color: var(--ok-ink); } .st.err { background: var(--off-bg); color: var(--off-ink); }
  .pl { background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; margin: 8px 0 0;
    font-size: 11.5px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; max-height: 220px; overflow: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  .kv { font-size: 11px; color: var(--muted); margin-top: 6px; font-family: ui-monospace, monospace; }
  .kv .k { color: var(--ink); }
  footer { color: var(--muted); font-size: 11.5px; margin-top: 24px; text-align: center; }
  .toast { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%); background: var(--ink); color: var(--bg);
    padding: 8px 16px; border-radius: 8px; font-size: 13px; opacity: 0; transition: opacity .2s; pointer-events: none; }
  .toast.show { opacity: 1; }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div class="logo">S</div>
    <div>
      <h1>SCIM Provisioning &mdash; Live Demo</h1>
      <p class="sub">Assign a user to the SCIM app in Okta &mdash; watch it provision, and see every request/response on the right.</p>
    </div>
    <div class="grow"></div>
    <button class="btn primary" id="toggleGuide">📋 Okta setup guide</button>
    <button class="btn danger" id="clearDb">🗑 Clear database</button>
  </header>

  <!-- SETUP GUIDE (values below are pulled live from this server's config) -->
  <section class="guide" id="guide" hidden>
    <div class="step">
      <h3>1 &middot; Enable the Provisioning capability</h3>
      <p class="why"><b>Why:</b> This integration only synchronises users &mdash; it does not do SSO. Provisioning is what turns on the SCIM user lifecycle.</p>
      <table class="ftable"><tbody>
        <tr><td class="f">Add integration capabilities</td><td>Toggle <span class="pick on">ON</span> <b>Provisioning</b> (Identity Lifecycle Management). Leave <b>SSO</b> off.</td></tr>
      </tbody></table>
    </div>

    <div class="step">
      <h3>2 &middot; OIN catalog properties</h3>
      <p class="why"><b>Why:</b> Cosmetic catalog listing metadata. Any friendly values are fine for the demo.</p>
      <table class="ftable">
        <thead><tr><th>Field</th><th>Value</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td class="f">Display name</td><td>${val('IAM H8 SCIM')}</td><td class="w">Name shown in the OIN catalog.</td></tr>
          <tr><td class="f">Description</td><td>${val('SCIM 2.0 provisioning for IAM H8, secured by OAuth 2.0.')}</td><td class="w">Catalog listing text.</td></tr>
          <tr><td class="f">Logo</td><td>Upload a PNG, 244&times;244, &lt;1&nbsp;MB</td><td class="w">Required catalog image.</td></tr>
          <tr><td class="f">Support email / phone / link</td><td>Optional</td><td class="w">Shown to customers for help.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="step">
      <h3>3 &middot; Use cases &amp; Tenant settings</h3>
      <p class="why"><b>Why:</b> Use cases just categorise the app. Tenant settings are per-customer variables &mdash; we don't need any because the SCIM URL and Keycloak are fixed.</p>
      <table class="ftable"><tbody>
        <tr><td class="f">Use cases</td><td>Tick <b>Directory and HR Sync</b> (optional)</td></tr>
        <tr><td class="f">Tenant settings</td><td>Leave empty</td></tr>
      </tbody></table>
    </div>

    <div class="step">
      <h3>4 &middot; Authentication settings</h3>
      <p class="why"><b>Why:</b> Okta gets an OAuth 2.0 access token from <b>Keycloak</b> using these, then sends it as the Bearer token on every SCIM call. This server validates that token's signature against Keycloak.</p>
      <table class="ftable">
        <thead><tr><th>Field</th><th>Value (click to copy)</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td class="f">Authentication mode</td><td>${val('OAuth 2')}</td><td class="w">Server accepts OAuth2 JWTs.</td></tr>
          <tr><td class="f">Authorize endpoint</td><td>${val(cfg.authEndpoint)}</td><td class="w">Where Okta starts the auth-code flow.</td></tr>
          <tr><td class="f">Token endpoint</td><td>${val(cfg.tokenEndpoint)}</td><td class="w">Where Okta gets / refreshes the token.</td></tr>
          <tr><td class="f">Client ID</td><td>${val(cfg.clientId)}</td><td class="w">Keycloak client registered for Okta.</td></tr>
          <tr><td class="f">Client secret</td><td>${val(cfg.clientSecret)}</td><td class="w">Authenticates that client.</td></tr>
          <tr><td class="f">Scopes</td><td>${val(cfg.scope)}</td><td class="w">Scope this server requires on the token.</td></tr>
        </tbody>
      </table>
      <details class="note">
        <summary>Why an interactive login &amp; consent — not just a static token?</summary>
        <div class="body">
          <p>Three separate identities are involved. Confusing them is what makes this feel odd:</p>
          <table class="mini"><tbody>
            <tr><td>${val(cfg.clientId)}</td><td>The <b>OAuth client</b> = Okta itself. Identifies who is asking for access.</td></tr>
            <tr><td>alice / alice</td><td>The <b>resource owner</b>. Logs in during the consent popup to <b>authorize</b> the connection.</td></tr>
            <tr><td>admin / admin</td><td>The <b>Keycloak admin</b> = the reviewer <b>test account</b> from step&nbsp;6. A different job entirely.</td></tr>
          </tbody></table>
          <p>Okta uses the OAuth 2.0 <b>Authorization Code</b> grant (with refresh tokens), which by design needs a login + consent because:</p>
          <ol>
            <li><b>Delegated &amp; password-free</b> — alice authenticates directly to Keycloak; her password never reaches Okta. Okta only ever holds <b>tokens</b>.</li>
            <li><b>Rotation</b> — you get a short-lived access token + a refresh token, so there is <b>no non-expiring secret</b> to leak.</li>
            <li><b>Governance</b> — a real person authorizes the scope. Revoke that user or the refresh token and provisioning stops.</li>
            <li><b>Protocol</b> — the browser is mandatory: alice logs in at Keycloak, which redirects an authorization <i>code</i> to Okta's registered URL; Okta then swaps it for tokens server-to-server.</li>
          </ol>
        </div>
      </details>
    </div>

    <div class="step">
      <h3>5 &middot; SCIM provisioning properties</h3>
      <p class="why"><b>Why:</b> The Base URL is the root of all SCIM calls (<span class="mono">{base}/Users</span>, <span class="mono">{base}/Groups</span>). The operations tell Okta which actions this server supports.</p>
      <table class="ftable">
        <thead><tr><th>Field</th><th>Value</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td class="f">Base URL</td><td>${val(cfg.scimBase)}</td><td class="w">Root of the SCIM API.</td></tr>
          <tr><td class="f">Objects</td><td><b>Users</b> (required) + <b>Groups</b> (optional, to demo group push)</td><td class="w">Resource types managed.</td></tr>
          <tr><td class="f">User operations</td><td>
            <span class="pick on">Create</span> <span class="pick on">Update</span> <span class="pick on">Deactivate</span>
            <span class="pick on">Support PATCH for User</span> &nbsp; <span class="pick off">Change password</span> <span class="pick off">Import User Schema</span></td>
            <td class="w">Server supports create/update/deactivate + PATCH. Password &amp; schema-import off.</td></tr>
          <tr><td class="f">Group operations</td><td><span class="pick on">Create</span> <span class="pick on">Read</span> <span class="pick on">Update</span> <span class="pick on">Delete</span></td><td class="w">Server implements full group CRUD.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="step">
      <h3>6 &middot; Configuration guide &amp; test account</h3>
      <p class="why"><b>Why:</b> Okta requires a reachable config-guide URL and a test account its reviewers can use. This dashboard doubles as the guide; the Keycloak admin console is the test account.</p>
      <table class="ftable">
        <thead><tr><th>Field</th><th>Value</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td class="f">Configuration guide URL</td><td>${val(cfg.configGuideUrl)}</td><td class="w">Reachable customer-facing guide.</td></tr>
          <tr><td class="f">Test &mdash; Account URL</td><td>${val(cfg.keycloakAdmin)}</td><td class="w">Where reviewers manage test users.</td></tr>
          <tr><td class="f">Test &mdash; Username / Password</td><td>${val('admin')} / ${val('admin')}</td><td class="w">Keycloak admin login.</td></tr>
        </tbody>
      </table>
      <details class="note">
        <summary>Why does Okta need these — and how is the test account different from the consent login?</summary>
        <div class="body">
          <table class="mini"><tbody>
            <tr><td>Config guide URL</td><td>OIN is <b>self-serve</b>: customers install your app without you present, so Okta needs your hosted instructions (and its reviewers read them). Must be a live URL.</td></tr>
            <tr><td>Test account (admin/admin)</td><td>Lets Okta's OIN reviewers <b>administer the target system</b> during manual QA — configure it, manage test users. Okta can't create one because your system is external.</td></tr>
            <tr><td>Consent login (alice/alice)</td><td>A different thing: the one-time OAuth <b>authorization</b> when you click <i>Authenticate</i> in step&nbsp;4. See "Why an interactive login" there.</td></tr>
          </tbody></table>
          <p>All three exist for one reason: OIN is a <b>public, multi-tenant, self-serve</b> catalog, so Okta needs self-serve docs, an independent way to QA before listing, and delegated auth that scales without shared secrets.</p>
        </div>
      </details>
    </div>

    <div class="step" style="border-left-color: var(--scim)">
      <h3>7 &middot; ⚠️ After creating the app — turn on "To App" provisioning</h3>
      <p class="why"><b>Why this matters most:</b> Assigning a user does <b>nothing</b> until this is enabled — Okta will only <i>read</i> your server, never <b>create</b>. This is the exact reason assigned users didn't appear.</p>
      <table class="ftable"><tbody>
        <tr><td class="f">Path</td><td>App &rarr; <b>Provisioning</b> tab &rarr; <b>To App</b> &rarr; <b>Edit</b></td></tr>
        <tr><td class="f">Enable</td><td><span class="pick on">Create Users</span> <span class="pick on">Update User Attributes</span> <span class="pick on">Deactivate Users</span> &rarr; <b>Save</b></td></tr>
        <tr><td class="f">Note</td><td>"To App" only appears <b>after</b> you enable &amp; <b>Save</b> the API integration.</td></tr>
      </tbody></table>
    </div>

    <div class="step" style="border-left-color: var(--scim)">
      <h3>8 &middot; Assign users &amp; watch it happen</h3>
      <p class="why"><b>Why:</b> Assignment is the trigger. Okta first checks existence with a filtered GET, then POSTs to create — you'll see both in the Activity log.</p>
      <table class="ftable"><tbody>
        <tr><td class="f">Path</td><td>App &rarr; <b>Assignments</b> &rarr; <b>Assign</b> &rarr; select people &rarr; Save</td></tr>
        <tr><td class="f">Expect in log</td><td><span class="mono">GET /Users?filter=userName eq "…"</span> &rarr; <span class="mono">POST /Users</span> &rarr; <span class="st ok">201</span></td></tr>
      </tbody></table>
    </div>
  </section>

  <div class="layout">
    <!-- MAIN -->
    <div>
      <div class="row2">
        <div class="card">
          <h2>How it works</h2>
          <ol class="flow">
            <li><b>Assign in Okta</b> <span>&mdash; add a user to the SCIM app under Assignments.</span></li>
            <li><b>Okta &rarr; Keycloak</b> <span>&mdash; Okta gets an OAuth 2.0 access token (JWT).</span></li>
            <li><b>Okta &rarr; SCIM</b> <span>&mdash; <code>POST /scim/v2/Users</code> with the Bearer token.</span></li>
            <li><b>Stored &amp; shown</b> <span>&mdash; this server validates the JWT, persists the user, and it appears below.</span></li>
          </ol>
        </div>
        <div class="card">
          <h2>Provisioned</h2>
          <div class="stats">
            <div class="stat"><div class="n" id="stat-total">&ndash;</div><div class="l">Total users</div></div>
            <div class="stat"><div class="n" id="stat-active">&ndash;</div><div class="l">Active</div></div>
            <div class="stat"><div class="n" id="stat-inactive">&ndash;</div><div class="l">Deactivated</div></div>
            <div class="stat"><div class="n" id="stat-groups">&ndash;</div><div class="l">Groups</div></div>
          </div>
        </div>
      </div>

      <div class="section-head">
        <h2>Provisioned users</h2>
        <span class="live"><span class="dot"></span> Live &middot; <span id="updated">&mdash;</span></span>
      </div>
      <div class="tablecard">
        <div class="scroll">
          <table>
            <thead><tr>
              <th>Status</th><th>Username</th><th>Name</th><th>Email</th><th>Groups</th><th>Okta ID</th><th>Created</th>
            </tr></thead>
            <tbody id="rows">
              <tr><td colspan="7" class="empty"><div class="big">Loading&hellip;</div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ACTIVITY LOG -->
    <aside class="logpanel">
      <div class="log-head">
        <div>
          <h2>Activity log</h2>
          <div class="legend">
            <span><span class="lg okta"></span>Okta</span>
            <span><span class="lg keycloak"></span>Keycloak</span>
            <span><span class="lg scim"></span>SCIM server</span>
          </div>
        </div>
        <button class="btn" id="clear">Clear</button>
      </div>
      <div class="log" id="log">
        <div class="log-empty">Waiting for traffic&hellip;<br>Assign a user in Okta to see the handshake.</div>
      </div>
    </aside>
  </div>

  <footer>Reads directly from the SCIM server &middot; UI build <code>${esc(cfg.buildId)}</code></footer>
</div>
<div class="toast" id="toast"></div>

<script>
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fmt = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return '—'; } };
  const time = (iso) => { try { return new Date(iso).toLocaleTimeString(); } catch { return ''; } };

  // ---- setup guide toggle + click-to-copy ----
  const guide = document.getElementById('guide');
  document.getElementById('toggleGuide').addEventListener('click', () => { guide.hidden = !guide.hidden; });
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1200);
  }
  document.addEventListener('click', (e) => {
    const c = e.target.closest('code.copy');
    if (!c) return;
    const v = c.getAttribute('data-v');
    navigator.clipboard.writeText(v).then(() => {
      c.classList.add('copied'); toast('Copied: ' + v);
      setTimeout(() => c.classList.remove('copied'), 700);
    }).catch(() => toast('Copy failed'));
  });

  // ---- users table (re-render only on real change) ----
  const seen = new Set();
  let firstUsers = true;
  let lastUsersSig = null;
  const usersSig = (d) => JSON.stringify({
    g: d.totalGroups,
    u: d.users.map((u) => [u.id, u.active, u.updatedAt, u.email, u.givenName, u.familyName, (u.groups || []).join(','), u.externalId]),
  });

  function renderUsers(data) {
    document.getElementById('stat-total').textContent = data.totalUsers;
    document.getElementById('stat-active').textContent = data.activeUsers;
    document.getElementById('stat-inactive').textContent = data.totalUsers - data.activeUsers;
    document.getElementById('stat-groups').textContent = data.totalGroups;
    document.getElementById('updated').textContent = 'updated ' + time(data.updatedAt);

    const tbody = document.getElementById('rows');
    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty"><div class="big">No users provisioned yet</div>Assign a user to the SCIM app in Okta and they will appear here.</td></tr>';
      return;
    }
    tbody.innerHTML = data.users.map((u) => {
      const isNew = !firstUsers && !seen.has(u.id);
      const name = [u.givenName, u.familyName].filter(Boolean).join(' ') || '—';
      const groups = u.groups.length ? u.groups.map((g) => '<span class="chip">' + esc(g) + '</span>').join('') : '<span class="mono">—</span>';
      const badge = u.active
        ? '<span class="badge on"><span class="d"></span>Active</span>'
        : '<span class="badge off"><span class="d"></span>Deactivated</span>';
      return '<tr class="' + (isNew ? 'new' : '') + '">' +
        '<td>' + badge + '</td>' +
        '<td class="name">' + esc(u.userName) + '</td>' +
        '<td>' + esc(name) + '</td>' +
        '<td class="email">' + (u.email ? esc(u.email) : '<span class="mono">—</span>') + '</td>' +
        '<td>' + groups + '</td>' +
        '<td class="mono">' + (u.externalId ? esc(u.externalId) : '—') + '</td>' +
        '<td class="mono">' + fmt(u.createdAt) + '</td>' +
      '</tr>';
    }).join('');
    data.users.forEach((u) => seen.add(u.id));
    firstUsers = false;
  }

  // ---- activity log (incremental: only insert new cards) ----
  function eventCard(e) {
    let line;
    if (e.kind === 'request') {
      line = '<span class="mono">' + esc(e.method || '') + ' ' + esc(e.path || '') + '</span>';
    } else {
      const cls = (e.status >= 200 && e.status < 300) ? 'ok' : 'err';
      line = '<span class="st ' + cls + '">' + esc(e.status) + '</span><span class="mono">' + esc((e.method || '') + ' ' + (e.path || '')) + '</span>';
    }
    const headers = (e.headers && Object.keys(e.headers).length)
      ? '<div class="kv">' + Object.entries(e.headers).map(([k, v]) => '<span class="k">' + esc(k) + ':</span> ' + esc(v)).join('<br>') + '</div>'
      : '';
    const body = (e.payload !== undefined && e.payload !== null)
      ? '<pre class="pl">' + esc(typeof e.payload === 'string' ? e.payload : JSON.stringify(e.payload, null, 2)) + '</pre>'
      : '';
    return '<div class="ev ' + esc(e.source) + '">' +
      '<div class="ev-top"><span class="actor">' + esc(e.actor) + '</span><span class="ts">' + time(e.ts) + '</span></div>' +
      '<div class="ev-line">' + line + '</div>' + headers + body +
    '</div>';
  }
  let renderedSeq = 0;
  function showLogEmpty() {
    document.getElementById('log').innerHTML =
      '<div class="log-empty">Waiting for traffic…<br>Assign a user in Okta to see the handshake.</div>';
    renderedSeq = 0;
  }
  function updateLog(events) {
    const el = document.getElementById('log');
    if (!events.length) { if (!el.querySelector('.log-empty')) showLogEmpty(); return; }
    const fresh = events.filter((e) => e.seq > renderedSeq);
    if (!fresh.length) return; // nothing new — leave the DOM untouched
    if (el.querySelector('.log-empty')) el.innerHTML = '';
    fresh.sort((a, b) => a.seq - b.seq).forEach((e) => el.insertAdjacentHTML('afterbegin', eventCard(e)));
    renderedSeq = events[events.length - 1].seq;
  }

  async function poll() {
    try {
      const [u, ev] = await Promise.all([
        fetch('/demo/api/users', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
        fetch('/demo/api/events', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
      ]);
      if (u) { const s = usersSig(u); if (s !== lastUsersSig) { lastUsersSig = s; renderUsers(u); } }
      if (ev) updateLog(ev.events);
    } catch (e) { /* keep last view on transient errors */ }
  }

  document.getElementById('clear').addEventListener('click', async () => {
    try { await fetch('/demo/api/events', { method: 'DELETE' }); } catch (e) {}
    showLogEmpty();
  });

  document.getElementById('clearDb').addEventListener('click', async () => {
    if (!confirm('Delete ALL provisioned users and groups from the database? This cannot be undone.')) return;
    try {
      const r = await fetch('/demo/api/data', { method: 'DELETE' });
      if (r.ok) { toast('Database cleared'); lastUsersSig = null; seen.clear(); poll(); }
      else toast('Clear failed (' + r.status + ')');
    } catch (e) { toast('Clear failed'); }
  });

  poll();
  setInterval(poll, 2000);
</script>
</body>
</html>`;
}
//# sourceMappingURL=demo.page.js.map