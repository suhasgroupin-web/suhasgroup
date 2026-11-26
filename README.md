# SUHAS GROUP

The main SUHAS GROUP platform is published at https://suhasgroup.pages.dev.

## Services on SUHAS GROUP
- SUHAS GROUP main app and workspace
- Facebook-style SUHAS Social
- SUHAS Messenger
- SUHAS AI
- Careers, Jobs, O5 International and Group services

SUHAS E-COM is not published or linked from the Group platform. Its production site is https://suhasmax.pages.dev and its source of truth is the separate `suhasgroupin-web/suhasmax` repository.

## Deployment
- Cloudflare Pages project: `suhasgroup`
- GitHub source: this repository, `main` branch
- Workflow: `.github/workflows/cloudflare-pages-deploy.yml`
- The workflow builds only the Group site and verifies the live homepage after deployment.
- Required GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

Legacy E-Commerce source folders are retained in GitHub for preservation but are excluded from the Group publish output. Legacy E-Commerce URLs redirect to SUHAS MAX.

No SUHAS E-COM database records or source files are deleted by the Group build.
