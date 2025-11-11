# Security Policy

## Project

Minecraft-Store-Redirect
Repository: [https://github.com/Daniel-Ric/Minecraft-Store-Redirect](https://github.com/Daniel-Ric/Minecraft-Store-Redirect)

---

## Supported Versions

The following versions receive security-related fixes:

| Version                             | Security Fixes Provided     |
| ----------------------------------- | --------------------------- |
| `main` branch (current development) | ✅                           |
| Tags/releases named `vX.Y.Z`        | ✅ if not marked end-of-life |
| Forks / modified copies             | ❌                           |

If you are running a fork or a significantly modified version, I may not be able to provide a direct patch for you. You are still encouraged to report vulnerabilities so they can be fixed upstream.

---

## What Is Considered a Security Issue

Please report anything that could impact the confidentiality, integrity, or availability of users or systems. For example:

### Authentication / Authorization

* Bypassing any intended restrictions (e.g., calling internal/debug endpoints if ever introduced)
* Abusing headers or redirect behavior to circumvent expected controls

> Note: This service intentionally exposes public redirect endpoints without authentication. Findings should focus on **unexpected** privilege or bypass, not the intended public nature.

### Data Exposure / Integrity

* Sensitive data leaked in responses, logs, or error messages
* Secrets, tokens, API keys, credentials or other sensitive values being exposed in code, config, logs, or responses

### Code Execution / Injection

* Remote Code Execution (RCE)
* Command or header injection
* Open redirect **beyond** the intended `minecraft://` scheme (e.g., ability to force HTTP/HTTPS or arbitrary schemes)
* Response splitting or header smuggling

### Denial of Service

* Inputs that can crash the service or cause resource exhaustion with realistic traffic
* Exploiting unbounded memory or CPU usage via path/parameter abuse

### Input Handling

* Missing or unsafe validation allowing escape from expected path semantics (e.g., CRLF in `:itemId` leading to header injection)
* Any vector that lets an attacker transform the redirect into an unintended target or payload

### Insecure Configuration

* Insecure defaults that would likely be used in production by mistake (e.g., overly verbose error stacks leaking internals)
* Missing transport security guidance for production deployments and reverse proxies

---

## Out of Scope

The following are generally **not** treated as security vulnerabilities (but they can still be filed as normal GitHub issues):

* Typos, dead links, grammar issues, or comment-only problems
* Purely theoretical attacks without realistic preconditions
* Extremely high traffic volumes that are obviously abusive (classic DDoS outside application logic)
* Issues within third-party libraries that are not reachable via this service
* Findings that rely on running the project in a way it’s **not** intended (e.g., exposing a dev-only build directly to the internet)
* The **intended** redirect to the `minecraft://` URL scheme (that is the core function of this service)

---

## How To Report a Vulnerability

**Do not open a public GitHub issue with exploit details.**

Instead, please report privately using one of these methods:

1. **Preferred:** Contact me directly on Discord
   User: `discord.com/users/252138923952832523`

2. **If Discord is not possible:**
   Open a GitHub issue in the repository with a title beginning with
   `SECURITY:`
   and include a way for me to contact you (for example your Discord username).
   Do **not** include full exploit details in the public issue. Just state that you believe you found a security problem.

### Your report should include:

* A clear description of the issue and affected component (endpoint/path)
* Exact steps to reproduce
* What you expected vs. what actually happened
* Potential impact (e.g., “arbitrary scheme redirect”, “header injection”, “service crash”)
* Minimal proof-of-concept request or payload, if available
* Environment details (version/commit hash, deployment mode, reverse proxy in front, etc.)

The more specific the report, the faster I can reproduce and confirm it.

---

## Disclosure Policy

* Please allow reasonable time to investigate, fix, and release a patch before any public disclosure.
* After a fix, I may reference the issue in release notes or commits without including sensitive exploit details.
* Credit:

  * If you’d like public credit, say so in your report.
  * If you prefer to remain anonymous, I will respect that.

---

## Handling of Leaked Secrets

This project is designed to be stateless and **not** require secrets to run. If you discover exposed credentials (e.g., in code, CI logs, or history):

1. Contact me privately on Discord at `discord.com/users/252138923952832523`.
2. Do **not** post the secret publicly (issues/PRs/screenshots).
3. I will rotate/revoke the secret and, if needed, scrub repository history.

---

## Security Practices in This Project

The project aims to follow these principles:

* **No secrets committed.**
  Configuration is provided via environment variables (`PORT`, etc.); no API keys are required.

* **Least privilege & minimal surface.**
  Only two GET endpoints for redirects are exposed; no write actions or external calls.

* **Explicit CORS.**
  CORS is permissive by default (`*`). If you deploy publicly and want to restrict embedding, tighten this header or introduce an allow-list.

* **Input normalization.**
  The `:itemId` parameter is directly interpolated into a deep link. Production deployments should consider:

  * Validating `itemId` against a safe pattern (e.g., `^[A-Za-z0-9._-]+$`)
  * Rejecting control characters and CR/LF
  * Enforcing length limits

* **Consistent error handling.**
  Avoid leaking stack traces in production (use `NODE_ENV=production` and conservative logging).

* **Dependency hygiene.**
  Keep dependencies reasonably up to date and address high-impact security advisories.

If you notice a part of the codebase that contradicts these goals, please report it privately.

---

## Proof-of-Concept / Exploit Testing

You may create proof-of-concept payloads **only** under these conditions:

* Test against **your own** local/dev environment.
* Do not attack infrastructure, accounts, or data you do not own.
* Do not attempt to access other people’s data.
* Do not conduct large-scale DoS testing against someone else’s environment.

A concise explanation like “I can inject CRLF via `itemId` to add headers” is sufficient. You do not need to demonstrate real harm.

---

## Hardening Recommendations (for Operators)

* Run behind a reverse proxy (e.g., Nginx) with HTTPS.
* Set `NODE_ENV=production` and restrict verbose logs.
* Consider adding:

  * Request size limits
  * Basic rate limiting
  * Input validation for `:itemId`
  * An allow-list for acceptable schemes/targets (ensure only `minecraft://` is emitted)
* If embedding links on the web, evaluate whether permissive CORS is suitable for your use case.

---

## Final Notes

Security reports are valuable whether critical (e.g., redirect escalation to arbitrary schemes) or subtle (e.g., header injection via special characters).

If you’re unsure whether something is in scope, assume it might be and contact me privately on Discord:
`discord.com/users/252138923952832523`.

Thank you for helping keep **Minecraft-Store-Redirect** safe.
