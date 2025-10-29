import Script from "next/script";

export default function TestLottie() {
  return (
    <>
      {/* Charge le web-component Lottie */}
      <Script
        src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
        strategy="afterInteractive"
      />

      {/* Player Lottie visible */}
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <lottie-player
          id="player"
          src="/lottie/squat-front.json"
          style={{ width: "100%", height: "420px" }}
          autoplay
          renderer="svg"
        ></lottie-player>
      </div>
    </>
  );
}
