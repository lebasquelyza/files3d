"use client";
import Lottie from "lottie-react";
import squatSide from "@/public/lottie/squat-side.json";

export default function SquatSide() {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Squat — Vue de profil</h2>
      <Lottie
        animationData={squatSide}
        loop={false}            // un squat pédagogique puis stop
        autoplay={true}
        style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}
      />
      <p className="opacity-70 text-sm mt-2">
        Astuce : observe l’alignement hanche-genou-cheville pendant la descente.
      </p>
    </div>
  );
}
