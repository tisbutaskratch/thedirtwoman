# Where things stand

Written 20 August 2026, after checking production directly rather than
guessing. Delete this file once the list is empty.

## What is working

Verified by request, not assumed:

| | |
| --- | --- |
| `sabawilhelm.com` | Live, valid certificate |
| `thedirthags.com` | Live, valid certificate |
| `api.thedirthags.com` | Live, valid certificate, `/health` returns ok |
| Database | Connected. Login and trip creation both work |
| DNS, all records | Correct and propagated, checked against the authoritative nameservers |

The domains, hosting and DNS are set up correctly. That part is done.

## What is not, in the order worth fixing

### 1. Fifteen commits are not deployed

Everything from the privacy policy onwards is committed locally and not on
`main`: privacy policy and consent, account deletion, the settings page,
per-site titles and link previews, the what's new page, calendar email,
broadened location kinds, and the rebuilt shared-trip deletion.

```
git push origin feature/trip-types-roles-and-mobile
```

Then open a pull request and merge it. Four migrations run automatically on
deploy, in this order:

1. `08ed4ca596bc` privacy consent columns
2. `4f87afd8e012` trip creator becomes optional
3. `c31d9a70b4e2` location kinds widened, `hotel` becomes `lodging`
4. `d5b21c8a9e77` drops the scheduled-deletion column

Watch the Render deploy log for four `Running upgrade` lines. All four were
smoke-tested up, down and up again against a throwaway database.

### 2. Uploading a file returns 500 in production

Confirmed by uploading one. The likely cause is the R2 settings: the code
needs `S3_BUCKET`, `S3_ENDPOINT_URL`, `S3_ACCESS_KEY_ID` and
`S3_SECRET_ACCESS_KEY` together. With none set it uses local disk; with all
four set but wrong it fails on upload, which is what a 500 looks like.

Render, the API service, Logs. The traceback will name it. Then either
finish the R2 setup (below) or clear all four to fall back to disk.

Until this is fixed nobody can attach anything, and anything already
attached is on a disk that Render wipes on every restart.

### 3. Cloudflare R2

1. Cloudflare, R2, create a bucket. Public access **off**.
2. Manage API Tokens, create one with Object Read & Write scoped to that
   bucket. Copy both the access key id and the secret; the secret is shown
   once.
3. The account id is in the R2 sidebar. The endpoint is
   `https://<account-id>.r2.cloudflarestorage.com`
4. Set all four variables on Render together. Save.

No CORS configuration is needed. Files are reached by navigating to a signed
URL rather than by a cross-origin fetch.

To check it worked: upload a file, redeploy, and see whether the file is
still there. Before this it would not be.

### 4. Invitation emails reach Resend and are refused

The path is right: the request returns in well under a second, which means
it is going over HTTPS to Resend rather than falling back to SMTP, which
Render's free tier blocks.

Render, Logs, search `Invite email`. The line gives the status and Resend's
own message. The two usual causes are a sending domain that was never
verified in Resend, and Resend's rule that an unverified domain can only
send to the account holder's own address. Both are fixed in Resend rather
than here.

The DNS side is correct: DKIM, SPF, the MX record and DMARC all resolve and
have propagated.

### 5. The free Postgres expires around 18 September

Thirty days from creation, then fourteen days of grace, then it is deleted.
Either upgrade the instance in Render, or take a dump and recreate it, which
resets the clock at the cost of downtime.

Worth taking a dump regardless, so a copy exists that does not depend on
Render:

```
pg_dump "<external connection string from Render>" > backup.sql
```

Put a reminder in the calendar for 11 September, a week ahead, while there
is still room to decide.

## Housekeeping

There is a `diagnostic-delete-me@example.com` account in production, used to
test the invite and upload paths from outside. It can be removed from the
settings page once signed in, or left alone.
