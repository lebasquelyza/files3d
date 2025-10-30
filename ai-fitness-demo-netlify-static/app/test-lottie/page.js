"use client";

import Script from "next/script";

export default function TestLottie() {
  return (
    <>
      {/* Charge lottie-web via CDN, après que la page soit interactive */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"
        strategy="afterInteractive"
      />
      {/* Initialise le player quand le DOM + lottie sont prêts */}
      <Script id="tl-init" strategy="afterInteractive">{`
        (function(){
          function ready(f){document.readyState!=='loading'?f():document.addEventListener('DOMContentLoaded',f)}
          ready(function(){
            var el = document.getElementById('anim');
            if(!el){ console.error('[test-lottie] container introuvable'); return; }
            if(!window.lottie){ console.error('[test-lottie] lottie non chargé'); return; }
            window.lottie.loadAnimation({
              container: el,
              renderer: 'svg',
              loop: true,
              autoplay: true,
              path: '/lottie/squat-front.json'
            });
          });
        })();
      `}</Script>

      {/* Cadre visible (hauteur garantie) */}
      <div
        id="anim"
        style={{
          width: "100%",
          height: 420,
          maxWidth: 720,
          margin: "24px auto",
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
        }}
      />
    </>
  );
}
