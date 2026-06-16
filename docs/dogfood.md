# Dogfood Notes

This project is used to test InsForge app creation, storage, auth, deployment, and Forger PR Guard in one small workflow.

## Verified Paths

- InsForge project creation and local CLI link
- Storage bucket creation for `motion-packages`
- Database migration for `motion_packages`
- Authenticated package upload
- Public package browsing and download
- InsForge frontend deployment
- GitHub Actions app check
- Forger project review in CI
- Forger PR summary artifact and PR comment

## Current Result

The app check passes locally, the live backend smoke test passes, and the deployed frontend is available at `https://iysg7ibv.insforge.site`.
