import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-400-italic.css';
import {createWorld} from './world.js';
import {storyProgress,smoothRange} from './choreography.js';
import './style.css';
gsap.registerPlugin(ScrollTrigger);
const chapters=[{id:'arrival',label:'Arrival',p:0},{id:'perspective',label:'Perspective',p:.16},{id:'threshold',label:'Beyond',p:.34},{id:'exploration',label:'Exploration',p:.58},{id:'human',label:'The human',p:.84}];
const studies=[
 {name:'Orbit',caption:'A delicate balance.',text:'Separate paths. One center. Watch the fragments hold a world together.'},
 {name:'Unfold',caption:'Let the structure breathe.',text:'Pull the pieces apart. What felt like a single form becomes a field of possibilities.'},
 {name:'Elsewhere',caption:'A different kind of order.',text:'Stretch the space between things. Sometimes the empty parts are the most interesting.'}
];
const skills=['Malware analysis','VAPT','System auditing','AI / ML'];
const exploring=['Network security','Secure coding','Linux','Python','Data structures & algorithms'];
function Arrow({diagonal=false}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d={diagonal?'M5 19 19 5M5 5h14v14':'M12 3v18m-6-6 6 6 6-6'}/></svg>}
function Mark(){return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><ellipse cx="20" cy="20" rx="8" ry="17" transform="rotate(40 20 20)"/><ellipse cx="20" cy="20" rx="8" ry="17" transform="rotate(-40 20 20)"/></svg>}
function App(){
 const canvas=useRef(null),engine=useRef(null),lenis=useRef(null),audio=useRef(null),indexButton=useRef(null);
 const [progress,setProgress]=useState(0),[menu,setMenu]=useState(false),[sound,setSound]=useState(false),[lowMotion,setLowMotion]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),[failed,setFailed]=useState(false),[mode,setMode]=useState(0);
 const current=chapters.reduce((found,c,i)=>progress>=c.p?i:found,0);
 const [nightMode,setNightMode]=useState(false);
 const skillsOpacity=lowMotion?1:smoothRange(.395,.42,progress)*(1-smoothRange(.525,.55,progress));
 const activeSkill=Math.min(3,Math.max(0,Math.floor((progress-.42)/.025)));
 useEffect(()=>{
   let world;
   try{world=createWorld(canvas.current,lowMotion);engine.current=world;setFailed(false);}catch(error){console.warn('3D scene unavailable',error);setFailed(true);}
   const smooth=lowMotion?null:new Lenis({duration:.95,smoothWheel:true});lenis.current=smooth;
   const tick=time=>smooth?.raf(time*1000);gsap.ticker.add(tick);smooth?.on('scroll',ScrollTrigger.update);
   let landmarks=[];
   const measure=()=>{landmarks=chapters.map(c=>({y:document.getElementById(c.id).offsetTop,p:c.p}));landmarks.push({y:Math.max(document.documentElement.scrollHeight-innerHeight,landmarks.at(-1).y+1),p:1})};
   const update=()=>{const p=storyProgress(window.scrollY,landmarks);world?.setProgress(p);setProgress(Math.round(p*1000)/1000);};
   measure();update();
   const trigger=ScrollTrigger.create({trigger:'.journey',start:'top top',end:'bottom bottom',onRefresh:()=>{measure();update()},onUpdate:update});
   const ctx=gsap.context(()=>{
     if(lowMotion)return;
     const story=(id)=>({trigger:id,start:'top top',end:'bottom bottom',scrub:true});
     gsap.timeline({scrollTrigger:story('#arrival')})
       .to('.opening-line:first-child',{xPercent:-12,opacity:0,ease:'none'},0)
       .to('.opening-line:nth-child(2)',{xPercent:12,opacity:0,ease:'none'},0)
       .to('.opening-line:nth-child(3)',{xPercent:-8,opacity:0,ease:'none'},0)
       .to('.opening-details',{opacity:0,y:-25,ease:'none'},0);
     gsap.timeline({scrollTrigger:story('#perspective')})
       .fromTo('.perspective-copy',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.25,ease:'none'})
       .to('.perspective-copy',{xPercent:12,opacity:0,duration:.25,ease:'none'},.72);
     gsap.timeline({scrollTrigger:story('#threshold')})
       .to('.threshold-word:first-child',{xPercent:-85,scale:1.7,opacity:0,ease:'none'},0)
       .to('.threshold-word:last-child',{xPercent:85,scale:1.7,opacity:0,ease:'none'},0)
       .to('.threshold-line',{scaleY:3,opacity:0,ease:'none'},0);
     gsap.timeline({scrollTrigger:story('#human')}).fromTo('.signature',{y:70,opacity:0},{y:0,opacity:1,ease:'power3.out',duration:1});
   });
   const resize=()=>ScrollTrigger.refresh();window.addEventListener('resize',resize);
   document.fonts.ready.then(()=>{if(engine.current===world)ScrollTrigger.refresh()});
   return()=>{window.removeEventListener('resize',resize);trigger.kill();ctx.revert();gsap.ticker.remove(tick);smooth?.destroy();world?.destroy();engine.current=null;};
 },[lowMotion]);
 useEffect(()=>{engine.current?.setMode(mode)},[mode,lowMotion]);
 useEffect(()=>{engine.current?.setNight(nightMode)},[nightMode,lowMotion]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const onChange=e=>setLowMotion(e.matches);media.addEventListener('change',onChange);return()=>media.removeEventListener('change',onChange)},[]);
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape'&&menu){setMenu(false);indexButton.current?.focus()}};addEventListener('keydown',onKey);return()=>removeEventListener('keydown',onKey)},[menu]);
 useEffect(()=>()=>{audio.current?.context.close()},[]);
 const go=(id,event)=>{setMenu(false);const el=document.getElementById(id);if(lenis.current)lenis.current.scrollTo(el,{duration:1.25,immediate:event?.detail===0});else el?.scrollIntoView({behavior:'instant'});};
 const toggleSound=async()=>{
   try{
     if(!audio.current){const context=new AudioContext(),master=context.createGain();master.gain.value=0;master.connect(context.destination);[55,82.41,110.12,164.81].forEach((frequency,i)=>{const oscillator=context.createOscillator(),gain=context.createGain();oscillator.frequency.value=frequency;gain.gain.value=.025/(i+1);oscillator.connect(gain);gain.connect(master);oscillator.start()});audio.current={context,master};}
     await audio.current.context.resume();audio.current.master.gain.setTargetAtTime(sound?0:1,audio.current.context.currentTime,.5);setSound(!sound);
   }catch{setSound(false)}
 };
 return <>
  <a className="skip" href="#exploration" onClick={e=>{e.preventDefault();go('exploration',e);document.querySelector('.experiment-button')?.focus({preventScroll:true})}}>Skip to explorations</a>
  <div className={'world '+(failed?'world-fallback':'')} aria-hidden="true"><canvas ref={canvas}/></div>
  <div className="vignette" aria-hidden="true"/>
  <button className="night-toggle" aria-label="Galaxy night mode" aria-pressed={nightMode} onClick={()=>setNightMode(v=>!v)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/></svg></button>
  <a className="portfolio-shortcut" href="/portfolio/">GO TO PORTFOLIO <Arrow diagonal/></a>
  <header><button className="brand" onClick={e=>go('arrival',e)} aria-label="Sumit Pandey, back to beginning"><Mark/><span>SUMIT PANDEY<span className="brand-sub">CYBERSECURITY / MPSTME, NMIMS</span></span></button><div className="header-right"><span className="edition">THE OBSERVATORY</span><button ref={indexButton} className="menu-toggle" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}>{menu?'Close':'Index'}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h14"/>{!menu&&<path d="M10 3v14"/>}</svg></button></div></header>
  {menu&&<><button className="menu-scrim" onClick={()=>setMenu(false)} aria-label="Close chapter index"/><nav id="navigation" className="menu-panel" aria-label="Chapters">{chapters.map((c,i)=><button key={c.id} onClick={e=>go(c.id,e)} aria-current={i===current?'location':undefined}><small>0{i+1}</small>{c.label}<Arrow diagonal/></button>)}<button className="motion-toggle" onClick={()=>setLowMotion(!lowMotion)} aria-pressed={lowMotion}>{lowMotion?'Enable cinematic motion':'Use reduced motion'}</button></nav></>}
  <main className={'journey '+(lowMotion?'reduced':'')} style={{'--exploration-opacity':lowMotion?1:smoothRange(.55,.579,progress)}}>
    <aside className="skills-exploring" aria-label="Additional areas of exploration" aria-hidden={skillsOpacity===0} style={{opacity:skillsOpacity,visibility:skillsOpacity>0?'visible':'hidden'}}><h3>EXPLORING</h3><p>{exploring.join(' · ')}</p></aside>
    <section id="arrival" className="chapter arrival"><div className="stage">
      <div className="opening-copy"><h1><span className="opening-line">Somewhere</span><span className="opening-line">between <em>what is</em></span><span className="opening-line">and <em>what if.</em></span></h1><div className="opening-details"><p className="intro">I’m Sumit. A B.Tech Cybersecurity student<br/>at MPSTME, NMIMS. Curious by nature.</p></div></div>
      <div className="object-label"><span className="label-rule"/><span>THE OBSERVATORY<small>AN EXPLORATION BY SUMIT PANDEY</small></span></div>
      <p className="edge-note">LOOK A LITTLE CLOSER.</p>
    </div></section>
    <section id="perspective" className="chapter perspective"><div className="stage"><div className="perspective-copy scene-copy"><h2>A different<br/>point <em>of view.</em></h2><p>Turn an idea around.<br/>The familiar begins to feel unfamiliar.</p></div><span className="vertical-note">FORM IS ONLY THE BEGINNING</span></div></section>
    <section id="threshold" className="chapter threshold"><div className="stage"><h2 className="threshold-copy"><span className="threshold-word">Go</span><span className="threshold-word"><em>beyond.</em></span></h2><span className="threshold-line" aria-hidden="true"/><div className="skills-passage" style={{opacity:skillsOpacity,visibility:skillsOpacity>0?'visible':'hidden'}} aria-hidden={skillsOpacity===0}><div className="skills-content"><h2>Beyond the surface</h2><p className="skills-eyebrow">MY SKILLS / CYBERSECURITY & COMPUTING</p><ol className="skills-list">{skills.map((skill,i)=><li key={skill} className={lowMotion||activeSkill===i?'skill-current':''}><span className="skill-number">0{i+1}</span><span>{skill}</span><span className="skill-marker" aria-hidden="true"/></li>)}</ol><p className="skills-footnote">Understanding systems. Looking deeper.</p></div></div></div></section>
    <section id="exploration" className="chapter exploration"><div className="stage"><div className="archive-copy scene-copy"><h2>Nothing here<br/>is <em>set in stone.</em></h2><p>Change the arrangement.<br/>See what happens to the whole.</p></div><div className="experiment-console"><div className="experiment-options" aria-label="Transform the sculpture">{studies.map((s,i)=><button className={'experiment-button '+(mode===i?'selected':'')} onClick={()=>setMode(i)} aria-pressed={mode===i} key={s.name}><small>0{i+1}</small><span>{s.name}</span><Arrow diagonal/></button>)}</div><div className="experiment-description" aria-live="polite"><h3>{studies[mode].caption}</h3><p>{studies[mode].text}</p></div><p className="archive-note">Original interactive studies. Explore my projects in the portfolio.</p></div></div></section>
    <section id="human" className="chapter human"><div className="stage"><div className="human-copy scene-copy"><h2>Still curious.<br/>Always <em>becoming.</em></h2><p>I’m Sumit Pandey.<br/>B.Tech Cybersecurity student<br/>at MPSTME, NMIMS.</p><div className="human-links"><a href="/portfolio/resume.html">Resume ↗</a><a href="mailto:Sumitt.pandey86@gmail.com">Email ↗</a><a href="https://github.com/Sumitt86">GitHub ↗</a><a href="https://www.linkedin.com/in/sumit-pandey-99807230b/">LinkedIn ↗</a></div><button className="return-link" onClick={e=>go('arrival',e)}>Back to the beginning<Arrow diagonal/></button></div><div className="signature">Sumit Pandey<span>THANK YOU FOR WANDERING.</span></div></div></section>
  </main>
  <footer className="hud"><button className={'sound '+(sound?'playing':'')} onClick={toggleSound} aria-pressed={sound}><span className="sound-bars" aria-hidden="true"><i/><i/><i/><i/></span>SOUND {sound?'ON':'OFF'}</button><nav className="chapter-track" aria-label="Journey chapters">{chapters.map((c,i)=><button key={c.id} className={i===current?'active':''} onClick={e=>go(c.id,e)} aria-label={`Go to ${c.label}`} aria-current={i===current?'step':undefined}><span className="track-line"/>{i===current&&<span className="chapter-title">{c.label}</span>}</button>)}</nav><span className="percentage">{String(Math.round(progress*100)).padStart(2,'0')} / 100</span></footer>
 </>;
}
createRoot(document.getElementById('root')).render(<App/>);
