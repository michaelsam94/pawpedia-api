# PawPedia API

Cloudflare Workers API for PawPedia. It proxies TheCatAPI, caches public breed data, and stores anonymous device favorites in D1.

## Local Development

```sh
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

The local API runs on `http://localhost:8787`.

## Scripts

```sh
npm test
npm run typecheck
npm run lint
```
