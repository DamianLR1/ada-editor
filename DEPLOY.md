# Como poner ADAForge en linea (GitHub Pages)

ADAForge es 100% frontend (React/Vite, sin backend) - el build genera un
sitio estatico puro, ideal para GitHub Pages.

## Pasos

1. Subi esta carpeta a un repo de GitHub:
   ```
   git init
   git add .
   git commit -m "ADAForge"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```

2. En el repo de GitHub: **Settings -> Pages -> Build and deployment -> Source**,
   elegi **GitHub Actions** (no "Deploy from a branch").

3. Listo. El workflow `.github/workflows/deploy-github-pages.yml` ya esta
   incluido en el proyecto: cada `git push` a `main` corre `npm run build` y
   publica el contenido de `dist/` automaticamente. No hace falta ningun
   secret ni token - usa los permisos internos de Actions.

4. La URL queda en **Settings -> Pages** una vez termine el primer deploy
   (tipicamente `https://<tu-usuario>.github.io/<tu-repo>/`), y tambien
   aparece como link en la pestaña **Actions** del run que lo publico.

Eso es todo - no hay otra configuracion necesaria.
