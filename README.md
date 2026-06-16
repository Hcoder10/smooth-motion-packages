# Smooth Motion Packages

Smooth Motion Packages is a small package exchange for web animation assets. Teams can publish motion presets, easing packs, UI snippets, and small archives, then browse and download them from one shared library.

The app is built with React, Vite, and InsForge. InsForge provides authentication, Postgres metadata, file storage, and frontend deployment.

## What It Does

- Lets signed-in users upload package files with version, author, homepage, description, and tags
- Shows a searchable package library with file size, publish date, and tags
- Lets anyone browse and download published packages
- Stores package metadata in `motion_packages`
- Stores package archives in the `motion-packages` storage bucket
- Runs Forger PR Guard in GitHub Actions to catch common InsForge SDK mistakes before review

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required environment variables:

- `VITE_INSFORGE_URL`
- `VITE_INSFORGE_ANON_KEY`

## Scripts

```bash
npm run test
npm run build
npm run check
```

`npm run check` runs the Vitest suite and the production build.

## Backend

Apply the SQL files in `migrations/` to create the table, indexes, RLS policies, and storage grants.

Access model:

- Anonymous users can read package metadata and download files.
- Authenticated users can publish package metadata and upload files.
- Files are limited to 15 MB by table checks and UI validation.

## CI

GitHub Actions runs:

1. App tests and production build
2. Forger project review against the checked-out app
3. A PR summary comment with any repair suggestions
4. A downloadable Forger artifact for review evidence
