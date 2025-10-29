"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

export default function PoseCounter({ mode = "squat" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState("up");
  const [tip, setTip] = useState("Autorise la webcam pour commencer.");
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let detector, raf, last = performance.now(), frames = 0, fpsTimer;
    let running = true;

    async function init() {
      await tf.setBackend("webgl");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.SINGLEPOSE_THUNDER }
      );

      setReady(true);
      fpsTimer = setInterval(() => {
        setFps(frames);
        frames = 0;
      }, 1000);

      const loop = async () => {
        if (!running) return;
        const poses = await detector.estimatePoses(videoRef.current, { flipHorizontal: true });
        draw(poses);
        logic(poses);
        frames++;
        raf = requestAnimationFrame(loop);
      };
      loop();
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    }

    init().catch(err => setTip("Erreur caméra: " + err.message));
    return () => { stop(); clearInterval(fpsTimer); };
  }, [mode]);

  function getAngle(a, b, c) {
    if (!a || !b || !c) return 180;
    const v1 = { x: a.x - b.x, y: a.y - b.y };
    const v2 = { x: c.x - b.x, y: c.y - b.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const n1 = Math.hypot(v1.x, v1.y), n2 = Math.hypot(v2.x, v2.y);
    const cos = Math.max(-1, Math.min(1, dot / (n1 * n2)));
    return (Math.acos(cos) * 180) / Math.PI;
  }

  function draw(poses) {
    const ctx = canvasRef.current.getContext("2d");
    const W = canvasRef.current.width = videoRef.current.videoWidth;
    const H = canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, W, H);

    const kp = poses?.[0]?.keypoints || [];
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(59,130,246,0.9)";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    kp.forEach(p => {
      if (p.score > 0.3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(10, 10, 160, 70);
    ctx.fillStyle = "white";
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText(`Reps: ${reps}`, 20, 35);
    ctx.fillText(`Phase: ${phase}`, 20, 55);
    ctx.fillText(`FPS: ${fps}`, 20, 75);
  }

  function logic(poses) {
    const kps = Object.fromEntries(
      (poses?.[0]?.keypoints || []).map(k => [k.name, k])
    );

    if (mode === "squat") {
      const angleKneeR = getAngle(kps["right_hip"], kps["right_knee"], kps["right_ankle"]);
      const angleKneeL = getAngle(kps["left_hip"], kps["left_knee"], kps["left_ankle"]);
      const knee = Math.min(angleKneeL, angleKneeR);

      if (knee < 80 && phase === "up") { setPhase("down"); setTip("Garde les talons au sol"); }
      if (knee > 165 && phase === "down") { setPhase("up"); setReps(r => r + 1); setTip("Bien ! Contrôle la montée"); }

      // simple back warning
      const backAngle = getAngle(kps["left_shoulder"], kps["left_hip"], kps["left_knee"]);
      if (backAngle < 140) setTip("Redresse le buste");
    }

    if (mode === "pushup") {
      const angleElbowR = getAngle(kps["right_shoulder"], kps["right_elbow"], kps["right_wrist"]);
      const angleElbowL = getAngle(kps["left_shoulder"], kps["left_elbow"], kps["left_wrist"]);
      const elbow = Math.min(angleElbowL, angleElbowR);

      if (elbow < 80 && phase === "up") { setPhase("down"); setTip("Coudes près du corps"); }
      if (elbow > 160 && phase === "down") { setPhase("up"); setReps(r => r + 1); setTip("Gainage serré"); }

      // simple hip warning
      const hipAngle = getAngle(kps["left_shoulder"], kps["left_hip"], kps["left_ankle"]);
      if (hipAngle > 190) setTip("Ne creuse pas le bas du dos");
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-2xl overflow-hidden shadow">
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>
        </div>
        <aside className="w-full md:w-80 card">
          <h3 className="font-semibold text-lg">Assistant</h3>
          <p className="opacity-80 mt-2">{ready ? tip : "Chargement du modèle..."}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="card"><div className="text-sm opacity-70">Répétitions</div><div className="text-2xl font-bold">{reps}</div></div>
            <div className="card"><div className="text-sm opacity-70">Phase</div><div className="text-2xl font-bold">{phase}</div></div>
          </div>
          <div className="mt-4 text-xs opacity-70">
            Astuce : place-toi latéralement pour les squats, et de profil (au sol) pour les pompes.
          </div>
        </aside>
      </div>
    </div>
  );
}
