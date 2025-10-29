import Script from "next/script";

export default function TestLottie() {
  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js" strategy="afterInteractive" />
      <Script id="tl-init" strategy="afterInteractive">{`
        (function(){
          function ready(f){document.readyState!=='loading'?f():document.addEventListener('DOMContentLoaded',f)}
          ready(function(){
            var el=document.getElementById('anim');
            if(!el||!window.lottie) return;
            window.lottie.loadAnimation({container:el,renderer:'svg',loop:true,autoplay:true,path:'/lottie/squat-front.json'});
          });
        })();
      `}</Script>
      <div id="anim" style={{width:"100%",height:420,maxWidth:720,margin:"20px auto",borderRadius:16,overflow:"hidden",background:"#fff"}} />
    </>
  );
}
