import React,{useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import gsap from 'gsap';
import Lenis from 'lenis';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-mono/latin-400.css';
import Technologies,{FocusArt} from './Technologies.jsx';
import './portfolio.css';
import {projects,contacts} from './profile.js';
gsap.registerPlugin(ScrollTrigger);
const skills=[['Malware analysis','Understanding malicious software and its behaviour.'],['VAPT','Vulnerability assessment & penetration testing.'],['System auditing','Examining systems, configurations and security controls.'],['AI / ML','Artificial intelligence & machine learning.']];
const overviewSkills=['Malware analysis','VAPT','System auditing','AI / ML','Data structures & algorithms','Computer networking','Linux / Unix','Databases & SQL','Secure coding','Git & version control','Python / Java / C','Web & API development'];
function Portfolio(){
useEffect(()=>{
 const mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion: no-preference)',()=>{
  const smooth=new Lenis({duration:.85,smoothWheel:true,syncTouch:false,anchors:true});
  const tick=time=>smooth.raf(time*1000);
  gsap.ticker.add(tick);smooth.on('scroll',ScrollTrigger.update);
  const ctx=gsap.context(()=>{
   if(window.scrollY<80 && !window.location.hash){
    gsap.timeline({defaults:{ease:'expo.out'}})
     .fromTo('.name-panel',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:2,ease:'expo.inOut',clearProps:'clipPath'},0)
     .fromTo('.system-status',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:2,ease:'expo.inOut',clearProps:'clipPath'},.2)
     .fromTo('.system-visual',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:2,ease:'expo.inOut',clearProps:'clipPath'},.3)
     .from('.title-first,.title-last',{yPercent:80,opacity:0,duration:1.6,stagger:.06,clearProps:'transform,opacity'},1)
     .from('.system-status h2,.system-status>a',{yPercent:100,opacity:0,duration:1.6,stagger:.04,clearProps:'transform,opacity'},1)
     .from('.name-top>p,.system-intro,.portfolio-header',{opacity:0,duration:1.2,clearProps:'opacity'},1);
   }
   gsap.from('.contact-section h2',{y:35,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:'.contact-section',start:'top 85%',once:true}});
   gsap.timeline({scrollTrigger:{trigger:'.intro-sequence',start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}})
    .to('.name-panel',{yPercent:-100,duration:.8,ease:'none'},0)
    .fromTo('.board-photo',{scale:1.12},{scale:1,duration:1,ease:'none'},0);
   gsap.utils.toArray('.project-list article').forEach(article=>{gsap.from(article.children,{y:36,opacity:0,stagger:.08,ease:'none',scrollTrigger:{trigger:article,start:'top 92%',end:'top 55%',scrub:true}})});
   gsap.fromTo('.project-image img',{scale:1.15},{scale:1,ease:'none',scrollTrigger:{trigger:'.project-editorial',start:'top bottom',end:'bottom bottom',scrub:true}});
   gsap.from('.footer-display',{yPercent:35,ease:'none',scrollTrigger:{trigger:'.site-footer',start:'top bottom',end:'bottom bottom',scrub:true}});
   const track=document.querySelector('.skills-track');
   gsap.to(track,{x:()=>-Math.max(0,track.scrollWidth-track.parentElement.clientWidth),ease:'none',scrollTrigger:{trigger:'.skills-sequence',start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}});
  });
  let alive=true;document.fonts.ready.then(()=>{if(alive)ScrollTrigger.refresh()});
  return()=>{alive=false;ctx.revert();gsap.ticker.remove(tick);smooth.destroy()};
 });
 return()=>mm.revert();
},[]);return <><a className="skip-link" href="#skills">Skip to skills</a><header className="portfolio-header" id="top"><a href="/portfolio/" className="wordmark">SP <span>SUMIT PANDEY</span></a><nav><a href="#skills">Skills</a><a href="#about">About</a><a href="/portfolio/resume.html">Resume</a><a href="/experience/">Experience ↗</a></nav></header><main><section className="intro-sequence"><div className="intro-sticky"><div className="main-stage"><div className="system-visual" aria-hidden="true"><img className="board-photo" src="/circuit-board.jpg" alt="" width="1600" height="1067" fetchPriority="high"/><p>LOOK BENEATH THE SURFACE</p></div><div className="name-panel"><div className="name-top"><span className="title-first">Sumit/</span><p>Cybersecurity student.<br/>Curious about systems.<br/>Driven to understand.</p></div><h1 className="title-last">Pandey.</h1><a className="block-button" href="#skills">Explore my skills <span>↗</span></a></div></div><aside className="system-panel"><div className="system-intro">Learning how systems work.<br/>And how to secure them.</div><div className="system-status"><h2>Areas of focus</h2>{overviewSkills.map((name,i)=><a href="#skills" key={name}><span>{String(i+1).padStart(2,"0")}. {name}</span><span aria-hidden="true">•</span></a>)}<p className="system-data" aria-hidden="true">01010011 01010101<br/>01001101 01001001<br/>01010100 00101111</p><p>B.TECH CYBERSECURITY<br/>MPSTME, NMIMS</p></div></aside></div></section><section className="skills-sequence" id="skills"><div className="skills-sticky"><div className="section-heading"><h2>Security / Computing</h2><span aria-hidden="true">01 — 04 ↗</span></div><div className="skills-window"><div className="skills-track">{skills.map(([name,description],i)=><article className="focus-panel" key={name}><div className={'focus-graphic graphic-'+i} aria-hidden="true"><FocusArt index={i}/></div><div className="focus-copy"><h3>{name}</h3><p>{description}</p></div></article>)}</div></div></div></section><Technologies/><section className="about-section" id="about"><h2>Still curious.<br/>Always learning.</h2><div className="about-grid"><p>I’m Sumit Pandey, pursuing a B.Tech in Computer Science and Engineering (Cybersecurity) at MPSTME, NMIMS, from 2023 to 2027. My interests bring together security, computer science, and intelligent systems.</p><div><h3>Also exploring</h3><p>Network security<br/>Secure coding<br/>Linux & Python<br/>Data structures & algorithms</p></div></div></section><section className="work-section" id="projects"><div className="section-heading"><h2>Selected projects.</h2><span>2024 — 2025</span></div><div className="project-editorial"><article className="featured-project"><div className="project-image"><img src="/circuit-board.jpg" alt="Close-up of electronic circuitry" width="1600" height="1067" loading="lazy"/></div><div className="featured-copy"><p className="eyebrow">FEATURED PROJECT / 2024</p><h3>Built for a community.<br/>Used by 1,000+ people.</h3><p>Sort My Entries grew organically into a community-driven event booking platform, bringing event discovery, listings, and ticketing into one streamlined experience.</p><a className="featured-link" href="/portfolio/resume.html">Explore my experience <span aria-hidden="true">↗</span></a></div></article><div className="project-list">{projects.map(project=><article key={project.name}><div><h3>{project.name}</h3><span>{project.year}</span></div><p>{project.description}</p></article>)}</div></div></section><section className="resume-section" id="resume"><div><h2>The details,<br/>in one place.</h2><p>Education, projects, skills and leadership.</p></div><a className="block-button" href="/portfolio/resume.html">View my resume <span aria-hidden="true">↗</span></a></section><section className="contact-section" id="contact"><p className='contact-kicker'>HAVE SOMETHING IN MIND?</p><h2>Let’s build<br/>something better.</h2><a className="email-link" href={'mailto:'+contacts.email}>{contacts.email}</a><nav aria-label="Social profiles"><a href={contacts.github}>GitHub ↗</a><a href={contacts.linkedin}>LinkedIn ↗</a></nav></section></main><footer className="site-footer"><div className="footer-grid"><a href="/portfolio/" className="footer-monogram" aria-label="Sumit Pandey home">SP↗</a><nav aria-label="Portfolio navigation"><a href="#projects">Projects</a><a href="#skills">Skills</a><a href="/portfolio/resume.html">Resume ↗</a></nav><nav aria-label="Connect"><span>Connect</span><a href={contacts.github}>↳ GitHub</a><a href={contacts.linkedin}>↳ LinkedIn</a><a href={'mailto:'+contacts.email}>↳ Email</a></nav><nav aria-label="More"><a href="#about">About</a><a href="/experience/">The experience ↗</a><span className="footer-education">MPSTME, NMIMS<br/>B.TECH CSE / CYBERSECURITY<br/>2023–2027</span></nav></div><div className="footer-display" aria-hidden="true">SUMIT.</div><div className="footer-bottom"><span>SUMIT PANDEY</span><a href="#top">BACK TO TOP ↑</a></div></footer></>}
createRoot(document.getElementById('root')).render(<Portfolio/>);







