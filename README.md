# CSS Service Solution

Static SEO lead-generation website for completeservicesolution.online.

## Build
```bash
npm run build
```
The generated website is written to `dist/`.

## Data
- `data/locations.json` contains cleaned CSS Service Solution location records from the supplied address workbook.
- `data/services.json` contains the 10 core services.

The generator creates state pages, location pages and service pages. It is intentionally data-driven so more locations can be added later.

## Website enquiry form
The contact form submits to `/api/enquiry` through a Cloudflare Pages Function. It does not open Gmail or the visitor's email app. Configure these production secrets/variables in Cloudflare Pages:
- `RESEND_API_KEY` — encrypted secret containing the Resend API key.
- `ENQUIRY_TO` — optional recipient email; defaults to `css.serviceinfo@gmail.com`.
- `ENQUIRY_FROM` — optional sender; defaults to `CSS Service Solution <onboarding@resend.dev>`. For production, verify `completeservicesolution.online` in Resend and use a sender on that domain.

### Sitemap fix
The build explicitly publishes `sitemap.xml` as `application/xml` and `robots.txt` as `text/plain` to improve crawler compatibility.
