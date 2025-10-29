import Script from "next/script";
import { EXERCISES } from "@/lib/exercises";

export const dynamicParams = false;
export async function generateStaticParams() {
  return EXERCISES.map(e => ({ slug: String(e.slug ?? e.id) }));
}

export default function ExercisePage({ params }) {
  const slug = String(params.slug);
  const ex = EXERCISES.find(e => String(e.slug) === slug) ?? EXERCISES.find(e => String(e.id) === slug);
  if (!ex) return <div className="card">Exercice introuvable.</div>;

  const isSquat = slug === "squat" || /squat/i.test(String(ex.name??""));
  const urls = ex?.lottie ?? (isSquat ? {
    front: "/lottie/squat-front.json",
    side:  "/lottie/squat-side.json",
    back:  "/lottie/squat-back.json",
  } : null);

  return (
    <>
      {urls && (
        <>
          <Script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js" strategy="afterInteractive" />
          <Script id="ex-init" strategy="afterInteractive">{`
            (function(){
              var map={front:'${urls.front}',side:'${urls.side}',back:'${urls.back}'};
              function ready(f){document.readyState!=='loading'?f():document.addEventListener('DOMContentLoaded',f)}
              ready(function(){
                var c=document.getElementById('anim'); if(!c||!window.lottie) return;
                var anim=null;
                function load(v){try{anim&&anim.destroy&&anim.destroy()}catch(e){} anim=window.lottie.loadAnimation({container:c,renderer:'svg',loop:false,autoplay:true,path:map[v]});}
                var btns=document.querySelectorAll('[data-view]'),replay=document.getElementById('replay');
                function active(t){btns.forEach(b=>{var on=b===t;b.classList.toggle('bg-blue-600',on);b.classList.toggle('text-white',on);b.classList.toggle('bg-gray-200',!on);b.classList.toggle('dark:bg-gray-700',!on);});}
                btns.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();var v=b.getAttribute('data-view');if(map[v]){load(v);active(b);}}));
                replay&&replay.addEventListener('click',()=>{try{anim.goToAndPlay(0,true)}catch(e){}});
                load('front');
              });
            })();
          `}</Script>
        </>
      )}

      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>

          {urls ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <button className="px-3 py-1 rounded-full text-sm bg-blue-600 text-white" data-view="front">Face</button>
                  <button className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700" data-view="side">Profil</button>
                  <button className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700" data-view="back">Dos</button>
                </div>
                <button id="replay" className="btn">Rejouer</button>
              </div>

              <div className="rounded-2xl overflow-hidden shadow bg-white dark:bg-gray-800/60" style={{width:"100%",maxWidth:720,margin:"0 auto"}}>
                <div id="anim" style={{width:"100%",height:420}} />
              </div>
            </>
          ) : ex.video ? (
            <video className="w-full rounded-xl" src={ex.video} poster={ex.thumbnail} controls loop playsInline />
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30">Aucune démo disponible pour cet exercice.</div>
          )}
        </div>

        {(ex.cues?.length || ex.mistakes?.length) && (
          <div className="card">
            <h3 className="font-semibold mb-2">Conseils</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {ex.cues?.length && (
                <div>
                  <div className="font-medium">À faire</div>
                  <ul className="list-disc pl-5 opacity-90">{ex.cues.map((c,i)=><li key={i}>{c}</li>)}</ul>
                </div>
              )}
              {ex.mistakes?.length && (
                <div>
                  <div className="font-medium">À éviter</div>
                  <ul className="list-disc pl-5 opacity-90">{ex.mistakes.map((m,i)=><li key={i}>{m}</li>)}</ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
