# AI Fitness Demo (Next.js + Tailwind + TensorFlow.js)

Un starter prêt à déployer pour un site d'exercices avec démonstrations et un mode pratique assisté par IA (MoveNet) qui compte les répétitions et donne un feedback simple.

## 🚀 Lancer en local

```bash
# 1) Installer les dépendances
npm install

# 2) Démarrer le serveur de dev
npm run dev
```

Ouvre http://localhost:3000

> Si tu vois la caméra noire, assure les permissions du navigateur et essaye sous Chrome/Edge.


## 📁 Structure

```
app/                 # App Router
  page.js            # Catalogue
  exercise/[slug]/   # Page exercice (détails + vidéo)
  practice/[slug]/   # Webcam + MoveNet + compteur
components/
  PoseCounter.jsx    # Détection de pose + logique reps
lib/
  exercises.js       # Catalogue (à éditer)
public/
  videos/            # Ajoute squat.mp4, pushup.mp4
  placeholder.jpg    # Vignette
tailwind.config.js
postcss.config.js
next.config.mjs
package.json
```

## ✍️ Modifier le contenu

- Ajoute tes vidéos dans `public/videos/` et vérifie les chemins dans `lib/exercises.js`.
- Ajoute de nouveaux exos en copiant un objet dans `EXERCISES` (avec `id`, `name`, `cues`, etc.).
- Les règles de comptage sont dans `components/PoseCounter.jsx` (blocs `mode === "squat"` / `"pushup"`).

## 🧠 À propos du modèle

- Utilise TensorFlow.js + `@tensorflow-models/pose-detection` (MoveNet Thunder).
- Tout tourne **dans le navigateur** (aucune donnée vidéo envoyée côté serveur).
- Pour de meilleures perfs mobile, tu peux passer à MoveNet Lightning.

## 🛫 Déploiement (Vercel)

1. Crée un repo GitHub et pousse ce projet.
2. Sur Vercel, "New Project" → importe ton repo → déploie.
3. Dans "Settings → Build & Development", garde les options par défaut.

## ⚠️ Avertissements

- Ne remplace pas les conseils d’un professionnel de santé.
- Les seuils d’angle sont **approximatifs**; teste et ajuste selon ton public.
- Vérifie les **droits/licences** de tes vidéos.

Bon build 💪
