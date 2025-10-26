import React, { useMemo, useState, useEffect, useRef } from "react";

const BASE_LETTERS = ["א","ב","ג","ד","ה","ו","ז","ח","ט","י","כ","ל","מ","נ","ס","ע","פ","צ","ק","ר","ש","ת"];
const FINAL_LETTERS = ["ך","ם","ן","ף","ץ"];

function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function pickOptions(target,pool,k=4){ const rest=pool.filter(l=>l!==target); const distractors=shuffle(rest).slice(0,Math.max(0,k-1)); return shuffle([target,...distractors]); }
function useSpeech(){ const speak=(text)=>{ try{ const u=new SpeechSynthesisUtterance(text); u.lang="he-IL"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);}catch(_e){} }; return speak; }

const LEVELS=[ {id:1,name:"התאם את האות",mode:"visual",goal:8}, {id:2,name:"הקשב ובחר",mode:"audio",goal:8} ];

export default function HebrewAlphabetGame(){
  const [includeFinals,setIncludeFinals]=useState(false);
  const [choicesCount,setChoicesCount]=useState(4);
  const [levelIndex,setLevelIndex]=useState(0);
  const [progress,setProgress]=useState(0);
  const [round,setRound]=useState(1);
  const [score,setScore]=useState(0);
  const [target,setTarget]=useState("א");
  const [options,setOptions]=useState(["א","ב","ג","ד"]);
  const [feedback,setFeedback]=useState(null);
  const [rtl,setRtl]=useState(true);
  const [bigMode,setBigMode]=useState(true);
  const [mistakes,setMistakes]=useState({});
  const [answers,setAnswers]=useState({visual:[],audio:[]}); // store separately
  const [phase,setPhase]=useState("playing");
  const cardRef=useRef(null);
  const speak=useSpeech();
  const level=LEVELS[levelIndex];
  const pool=useMemo(()=>includeFinals?[...BASE_LETTERS,...FINAL_LETTERS]:BASE_LETTERS,[includeFinals]);

  useEffect(()=>{ startLevel(0); },[]);

  function startLevel(idx){ setLevelIndex(idx); setProgress(0); setRound(1); setScore(0); setMistakes({}); setPhase("playing"); nextRound(); }

  function nextRound(forceLetter){ const t=forceLetter||pool[Math.floor(Math.random()*pool.length)]; setTarget(t); setOptions(pickOptions(t,pool,choicesCount)); setFeedback(null); if(level.mode==="audio") setTimeout(()=>speak(t),50); }

  function onChoose(l){ if(feedback||phase!=="playing")return; const correct=l===target;
    const newAnswer={letter:target,chosen:l,correct};
    setAnswers(prev=>({...prev,[level.mode]:[...prev[level.mode],newAnswer]}));
    if(correct){ setFeedback("right"); setScore(s=>s+1); setProgress(p=>p+1); speak(l); pulse(cardRef); const willFinishLevel=progress+1>=level.goal; setTimeout(()=>{ if(willFinishLevel){ const next=levelIndex+1; if(next<LEVELS.length){ setPhase("between"); }else{ setPhase("finished"); } }else{ setRound(r=>r+1); nextRound(); } },800);} else { setFeedback("wrong"); setMistakes(m=>({...m,[target]:(m[target]||0)+1})); shake(cardRef); setTimeout(()=>setFeedback(null),400);} }

  function pulse(ref){ if(!ref.current)return; ref.current.animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}],{duration:250,easing:"ease-out"}); }
  function shake(ref){ if(!ref.current)return; ref.current.animate([{transform:"translateX(0)"},{transform:"translateX(-8px)"},{transform:"translateX(8px)"},{transform:"translateX(0)"}],{duration:220,easing:"ease-in-out"}); }

  const weakLetters=useMemo(()=>{ const entries=Object.entries(mistakes); return entries.length?entries.sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]):[]; },[mistakes]);
  const progressPct=Math.min(100,Math.round((progress/level.goal)*100));

  return(
    <div className={`min-h-screen ${rtl?"rtl":''} bg-gray-50 p-4 flex items-center justify-center`} dir={rtl?"rtl":"ltr"}>
      <div className="w-full max-w-3xl">
        <header className="flex items-center justify-between gap-2 mb-4">
          <h1 className="text-2xl font-bold">משחק אותיות בעברית</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setRtl(v=>!v)} className="px-3 py-2 rounded-2xl shadow text-sm bg-white">כיוון: {rtl?"ימין→שמאל":"שמאל→ימין"}</button>
            <button onClick={()=>setBigMode(v=>!v)} className="px-3 py-2 rounded-2xl shadow text-sm bg-white">גודל: {bigMode?"גדול":"רגיל"}</button>
          </div>
        </header>

        {phase==="between"&&(
          <div className="bg-white rounded-3xl p-8 shadow text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold mb-2">כל הכבוד! סיימת את השלב: {level.name}</h2>
            <button className="px-4 py-2 rounded-2xl bg-green-500 text-white shadow" onClick={()=>startLevel(levelIndex+1)}>לשלב הבא</button>
          </div>
        )}

        {phase==="finished"&&(
          <div className="relative bg-white rounded-3xl p-8 shadow text-center overflow-hidden">
            <ConfettiOverlay/>
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-2xl font-extrabold mb-2">סיימת את כל השלבים!</h2>
            <p className="mb-4">ניקוד כולל: {score}</p>
            <div className="text-left text-sm mb-4">
              <h3 className="font-semibold mb-1">שלב 1 – התאם את האות</h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 text-xl mb-3">
                {answers.visual.map((a,i)=>(<div key={i} className={`rounded-xl p-2 ${a.correct?"bg-green-100 border-green-400":"bg-red-100 border-red-400"} border`}>{a.letter}</div>))}
              </div>
              <h3 className="font-semibold mb-1">שלב 2 – הקשב ובחר</h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 text-xl">
                {answers.audio.map((a,i)=>(<div key={i} className={`rounded-xl p-2 ${a.correct?"bg-green-100 border-green-400":"bg-red-100 border-red-400"} border`}>{a.letter}</div>))}
              </div>
            </div>
            <button className="px-4 py-2 rounded-2xl bg-blue-600 text-white shadow" onClick={()=>startLevel(0)}>שחקו שוב</button>
          </div>
        )}

        {phase==="playing"&&(
          <section className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-3xl p-4 shadow">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                  <span>שלב</span><span className="font-semibold">{round}</span><span>·</span><span>רמה</span><span className="font-semibold">{level.id}</span><span>— {level.name}</span><span>·</span><span>ניקוד</span><span className="font-semibold">{score}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>speak(target)} className="px-3 py-1 rounded-xl shadow bg-white">🔊</button>
                  <button onClick={()=>startLevel(levelIndex)} className="px-3 py-1 rounded-xl shadow bg-white">איפוס שלב</button>
                </div>
              </div>
              <div className="mt-3 w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width:progressPct+"%"}}/></div>
              <div className="text-xs text-gray-600 mt-1">התקדמות: {progress}/{level.goal}</div>
              <div ref={cardRef} className={`mt-4 rounded-3xl border ${feedback==="right"?"border-green-400 bg-green-50":feedback==="wrong"?"border-red-400 bg-red-50":"border-gray-200 bg-gray-50"} p-6 flex items-center justify-center`}>
                {level.mode==="visual"?(<div className={`${bigMode?"text-8xl":"text-6xl"} font-black`}>{target}</div>):(<button onClick={()=>speak(target)} className="text-5xl">🔊</button>)}
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {options.map((l,i)=>(<button key={i} onClick={()=>onChoose(l)} className={`rounded-3xl border border-gray-200 bg-white shadow hover:shadow-md transition px-4 py-6 ${bigMode?"text-4xl":"text-3xl"} font-bold`}>{l}</button>))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow">
              <h2 className="font-semibold mb-2">הגדרות</h2>
              <label className="flex items-center justify-between gap-3 text-sm"><span>כלול סופיות ךםןףץ</span><input type="checkbox" checked={includeFinals} onChange={e=>{setIncludeFinals(e.target.checked);nextRound();}}/></label>
              <label className="flex items-center justify-between gap-3 text-sm"><span>מספר אפשרויות לתשובה</span><input className="w-24" type="range" min={2} max={5} value={choicesCount} onChange={e=>{setChoicesCount(parseInt(e.target.value,10));nextRound(target);}}/><span className="tabular-nums">{choicesCount}</span></label>
              {weakLetters.length>0&&(<div className="mt-2 text-xs text-gray-600">אותיות למיקוד: {weakLetters.join(" · ")}</div>)}
            </div>
          </section>
        )}
        <footer className="text-center text-xs text-gray-500 mt-2">טיפ: לחץ על 🔊 כדי לשמוע את האות.</footer>
      </div>
      <style>{`.rtl{direction:rtl;}`}</style>
    </div>
  );
}

function ConfettiOverlay(){ const ref=useRef(null); useEffect(()=>{ const el=ref.current; if(!el)return; const pieces=40; const spans=[]; const syms=["🎈","🎉","✨","⭐","🎊"]; for(let i=0;i<pieces;i++){ const s=document.createElement('span'); s.textContent=syms[i%syms.length]; s.style.position='absolute'; s.style.left=Math.random()*100+'%'; s.style.top='-10%'; s.style.fontSize=(16+Math.random()*20)+'px'; s.style.opacity='0.9'; s.style.transition='transform 2.2s ease-in, opacity 2.2s linear'; el.appendChild(s); spans.push(s); setTimeout(()=>{ s.style.transform='translateY(140%)'; s.style.opacity='0'; },Math.random()*400);} const t=setTimeout(()=>{spans.forEach(s=>s.remove());},2600); return()=>clearTimeout(t);},[]); return <div ref={ref} className="pointer-events-none absolute inset-0"/>;}
