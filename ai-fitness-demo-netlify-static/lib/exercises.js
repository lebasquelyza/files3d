export const EXERCISES = [
  {
    id: "squat",
    name: "Squat",
    level: "Débutant",
    muscles: ["Quadriceps", "Fessiers", "Ischios"],
    lottie: {
      front: "/lottie/squat-front.json",
      side:  "/lottie/squat-side.json",
      back:  "/lottie/squat-back.json"
    },
    cues: [
      "Pieds largeur d'épaules",
      "Genoux suivent les orteils",
      "Dos neutre, poitrine fière"
    ],
    mistakes: [
      "Talons qui se décollent",
      "Genoux qui rentrent",
      "Arrondir le bas du dos"
    ]
  },
  {
    id: "pushup",
    name: "Pompes",
    level: "Intermédiaire",
    muscles: ["Pectoraux", "Épaules", "Triceps", "Gainage"],
    video: "/videos/pushup.mp4",
    thumbnail: "/placeholder.jpg",
    cues: ["Corps gainé", "Coudes ~45°", "Respiration contrôlée"]
  }
];
