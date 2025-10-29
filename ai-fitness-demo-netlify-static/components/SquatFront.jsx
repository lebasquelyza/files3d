"use client";
import Lottie from "lottie-react";
import squatFront from "@/public/lottie/squat-front.json";

export default function SquatFront() {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Squat — Vue de face</h2>
      <Lottie
        animationData={squatFront}
        loop={false}
        style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}
      />
    </div>
  );
}
