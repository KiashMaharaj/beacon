# Beacon email templates

On-brand HTML for the transactional emails Supabase Auth sends. They use the
Beacon logo (served from `https://www.usebeacon.co.za/icon-192.png`) and keep
Supabase's template variables intact (e.g. `{{ .ConfirmationURL }}`) so the
links still work.

| File | Supabase template | Suggested subject |
|------|-------------------|-------------------|
| `confirm-signup.html` | **Confirm signup** | `Confirm your Beacon account 🐾` |
| `reset-password.html` | **Reset password** | `Reset your Beacon password` |
| `magic-link.html` | **Magic Link** | `Your Beacon sign-in link` |
| `change-email.html` | **Change Email Address** | `Confirm your new email for Beacon` |

## Where to paste them

1. Open the Supabase dashboard → your project.
2. Left sidebar → **Authentication** → **Emails** (older projects: **Email Templates**).
3. Pick a template from the list (Confirm signup, Reset password, Magic Link,
   Change Email Address).
4. **Subject**: set it from the table above.
5. **Message body**: switch the editor to the **HTML / source** view, delete what's
   there, and paste the matching file's contents.
6. Click **Save**. Repeat for each template.

## Important

- **Don't change the `{{ .ConfirmationURL }}` placeholders** — Supabase replaces
  them with the real, per-user link when it sends the email. Removing or editing
  them breaks sign-in / reset.
- These are **transactional** account emails (confirmation, reset, sign-in). They
  are separate from marketing/newsletter emails and don't need an unsubscribe
  link.
- Sending itself is handled by the **custom SMTP (Resend)** already configured
  under Authentication → Emails → SMTP Settings. These templates only define the
  content, so make sure the **Sender name** is `Beacon` and the **Sender email**
  is on your verified domain (e.g. `no-reply@usebeacon.co.za`).
- Email clients don't all support gradients; the header falls back to a solid
  Beacon orange (`#f97316`) where gradients aren't supported.

## Test after saving

- **Confirm signup**: create a new account → you should get the branded email.
- **Reset password**: on the login screen, tap *Forgot password* → check the email.
