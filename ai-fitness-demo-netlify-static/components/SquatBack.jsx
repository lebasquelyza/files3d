"use client";
import Lottie from "lottie-react";
import squatBack from "@/public/lottie/squat-back.json";

export default function SquatBack() {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Squat — Vue de dos</h2>
      <Lottie
        animationData={squatBack}
        loop={false}            // un squat pédagogique puis stop
        autoplay={true}
        style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}
      />
      <p className="opacity-70 text-sm mt-2">
        Astuce : genoux qui suivent les orteils, évite qu’ils rentrent vers l’intérieur.
      </p>
    </div>
  );
}
