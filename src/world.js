import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { cameraPose, smoothRange } from './choreography.js';

export function createWorld(canvas, reduced) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const mobile = () => innerWidth < 760;
  const pixelRatio = () => Math.min(devicePixelRatio, mobile() ? 1.35 : 1.65);
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new T.Scene();
  scene.fog = new T.FogExp2('#526362', .011);
  const camera = new T.PerspectiveCamera(42, innerWidth / innerHeight, .08, 320);
  const owned = [];
  const own = resource => (owned.push(resource), resource);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new T.Vector2(innerWidth, innerHeight), .38, .55, .82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const sky = new T.Mesh(own(new T.SphereGeometry(250, 32, 20)), own(new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false,
    uniforms: { uNight: { value: 0 }, uTime: { value: 0 }, uDawn: { value: 0 }, uGalaxy: { value: 0 } },
    vertexShader: `varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 vP; uniform float uNight,uTime,uDawn,uGalaxy;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
      float dust(vec2 p){return noise(p)*.55+noise(p*2.03)*.27+noise(p*4.07)*.12+noise(p*8.1)*.06;}
      void main(){vec3 d=normalize(vP);float h=d.y;
        vec3 day=mix(vec3(.10,.19,.18),vec3(.014,.048,.075),smoothstep(-.05,.8,h));
        vec3 night=mix(vec3(.04,.10,.14),vec3(.009,.018,.048),smoothstep(-.1,.6,h));
        float ribbon=exp(-abs(h-(.26+sin(d.x*5.+d.z*2.+uTime*.025)*.06))*24.);
        night+=vec3(.035,.19,.16)*ribbon*(.4+.6*sin(d.x*13.+d.z*9.+uTime*.04)*sin(d.x*13.+d.z*9.+uTime*.04));
        vec3 c=mix(day,night,uNight);
        vec3 sunDir=normalize(vec3(55.,24.,-90.));float sd=max(0.,dot(d,sunDir));
        c+=vec3(.55,.35,.13)*(pow(sd,380.)*.65+pow(sd,20.)*.07)*(1.-uNight);
        float star=step(.9986,hash(floor(d.xz/max(.08,abs(d.y))*450.)))*smoothstep(.02,.35,h);
        c+=vec3(.6,.75,.8)*star*uNight;
        c=mix(c,c+vec3(.19,.06,.006)*exp(-abs(h)*5.),uDawn);
        vec2 uv=vec2(atan(d.x,-d.z),asin(d.y));
        float latitude=dot(d,normalize(vec3(.48,.78,.40)));
        float clouds=dust(uv*7.);
        float band=exp(-pow((latitude+(clouds-.5)*.11)/.17,2.));
        float lane=smoothstep(.32,.68,dust(uv*19.+8.));
        vec3 galaxy=vec3(.002,.004,.014)+vec3(.065,.075,.13)*band*clouds;
        galaxy+=mix(vec3(.085,.052,.085),vec3(.13,.15,.18),clouds)*band*lane*.75;
        galaxy*=1.-band*(1.-lane)*.68;
        vec2 cell=uv*650.,grid=floor(cell),point=fract(cell)-.5;
        float pick=hash(grid),spark=exp(-dot(point,point)*150.)*step(.991,pick);
        float fine=exp(-dot(point,point)*60.)*step(.96,pick)*band*.2;
        vec3 temperature=mix(vec3(.65,.78,1.),vec3(1.,.86,.67),hash(grid+23.));
        galaxy+=temperature*(spark*.9+fine);
        c=mix(c,galaxy,uGalaxy);
        gl_FragColor=vec4(c,1.);
      }`
  })));
  scene.add(sky);
  const ambient = new T.HemisphereLight('#d9e4d7', '#10292c', 1.7);
  scene.add(ambient);
  const sunlight = new T.DirectionalLight('#ffdfac', 3.0);
  sunlight.position.set(-15, 22, 12); scene.add(sunlight);
  const rim = new T.DirectionalLight('#7bc7bd', 2.2);
  rim.position.set(4, 8, -30); scene.add(rim);
  const tex = own(new T.TextureLoader().load('/limestone.png'));
  tex.colorSpace = T.SRGBColorSpace; tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.anisotropy = 4;
  const stone = own(new T.MeshStandardMaterial({ color: '#c3c4b9', map: tex, bumpMap: tex, bumpScale: .13, roughness: .88 }));
  const blackStone = own(new T.MeshStandardMaterial({ color: '#6d8680', map: tex, roughness: .92 }));
  const brass = own(new T.MeshStandardMaterial({ color: '#dbc5a0', metalness: .58, roughness: .28 }));
  const luminous = own(new T.MeshBasicMaterial({ color: new T.Color(1.25, 1.1, .78) }));
  const cyan = own(new T.MeshBasicMaterial({ color: new T.Color(.28, .72, .76) }));
  let seed = 29;
  const rand = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
  const height = (x,z) => {
    const basin = Math.max(0, Math.abs(x - 3.8) - 11) * .34;
    const n = Math.sin(x*.19+Math.cos(z*.17))*1.6 + Math.sin(x*.51+z*.23)*.54 + Math.sin(x*1.7-z*.69)*.10;
    return -5.3 + basin + n*Math.min(1,Math.abs(x-3.8)/16);
  };
  const terrainG = own(new T.PlaneGeometry(220, 260, 160, 180)); terrainG.rotateX(-Math.PI/2);
  const positions = terrainG.attributes.position;
  const terrainColors = [];
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i),y=height(x,z);
    positions.setY(i,y);
    const color=new T.Color().setHSL(.43,.11,.12+Math.max(0,y+5)*.013+rand()*.017);
    terrainColors.push(color.r,color.g,color.b);
  }
  terrainG.setAttribute('color',new T.Float32BufferAttribute(terrainColors,3));terrainG.computeVertexNormals();
  const terrain = new T.Mesh(terrainG,own(new T.MeshStandardMaterial({vertexColors:true,roughness:.94})));scene.add(terrain);

  const water = new T.Mesh(own(new T.PlaneGeometry(240,260)),own(new T.ShaderMaterial({
    uniforms:{uTime:{value:0},uNight:{value:0},uEye:{value:new T.Vector3()}},
    vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`varying vec3 vW;uniform float uTime,uNight;uniform vec3 uEye;
      void main(){vec2 p=vW.xz;float w=sin(p.x*2.+p.y*.9+uTime*.3)*.025+sin(p.x*.7-p.y*2.1-uTime*.2)*.016;
      vec3 n=normalize(vec3(w,1.,cos(p.y*1.7+uTime*.2)*.025));vec3 v=normalize(uEye-vW);
      float f=pow(1.-max(0.,dot(n,v)),3.);vec3 c=mix(vec3(.023,.055,.061),vec3(.20,.31,.29),f);
      float streak=pow(max(0.,1.-abs(p.x-3.8)*.16),14.);float ripple=.5+.5*sin(p.y*7.+w*50.);
      c+=vec3(.22,.26,.16)*streak*ripple*.23;c=mix(c,c*vec3(.25,.48,.7),uNight);
      float glint=pow(max(0.,dot(reflect(-normalize(vec3(-15.,22.,12.)),n),v)),170.);c+=vec3(.8,.57,.23)*glint*(1.-uNight);
      gl_FragColor=vec4(c,1.);}`
  }))); water.rotation.x=-Math.PI/2;water.position.y=-3.95;scene.add(water);
  // Scale cues: distant stone needles rise above the reflective basin.
  const monolithG=own(new T.BoxGeometry(1,1,1));
  for(let i=0;i<18;i++){
    const side=i%2===0?-1:1,x=3.8+side*(15+rand()*60),z=18-rand()*120;
    const mesh=new T.Mesh(monolithG,i%3===0?stone:blackStone);
    const h=3+rand()*13;mesh.scale.set(.5+rand()*1.8,h,.8+rand()*1.4);mesh.position.set(x,height(x,z)+h/2,z);mesh.rotation.z=side*rand()*.2;scene.add(mesh);
  }
  const observatory = new T.Group();observatory.position.set(3.8,2.6,0);scene.add(observatory);
  // Asymmetric stone planes replace the prototype's stacked circular pedestal.
  const slabs=[];
  for(let i=0;i<7;i++){
    const slab=new T.Mesh(own(new T.BoxGeometry(6.8-i*.35,.30,4.8-i*.18)),i%3===0?blackStone:stone);
    slab.position.set((i%2?1:-1)*.24,-5.8+i*.40,.5);slab.rotation.y=-.3+i*.05;observatory.add(slab);slabs.push(slab);
  }
  const segmentShape=new T.Shape();const count=48,arc=Math.PI*2/count*.94;
  for(let i=0;i<=5;i++){const a=-arc/2+arc*i/5;const x=Math.sin(a)*3,y=Math.cos(a)*3;if(i===0)segmentShape.moveTo(x,y);else segmentShape.lineTo(x,y)}
  for(let i=5;i>=0;i--){const a=-arc/2+arc*i/5;segmentShape.lineTo(Math.sin(a)*2.48,Math.cos(a)*2.48)}segmentShape.closePath();
  const segmentG=own(new T.ExtrudeGeometry(segmentShape,{depth:.65,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,steps:1}));segmentG.translate(0,0,-.325);
  const segments=[];
  for(let i=0;i<count;i++){const mesh=new T.Mesh(segmentG,i%8===0?brass:stone);mesh.rotation.z=i/count*Math.PI*2;observatory.add(mesh);segments.push(mesh)}
  const aperture=new T.Mesh(own(new T.TorusGeometry(2.44,.022,8,128)),luminous);observatory.add(aperture);
  const orbit=new T.Group();observatory.add(orbit);const orbitRings=[];
  for(let i=0;i<3;i++){const m=new T.Mesh(own(new T.TorusGeometry(1.6-i*.1,.018,8,96)),brass);orbit.add(m);orbitRings.push(m)}
  const core=new T.Mesh(own(new T.IcosahedronGeometry(.18,2)),luminous);orbit.add(core);
  // A real tunnel occupies the space beyond the aperture. No camera reset at the crossing.
  const tunnel=new T.Group();scene.add(tunnel);const tunnelRings=[];
  for(let i=0;i<11;i++){
    const ring=new T.Mesh(own(new T.TorusGeometry(2.44+i*.055,.023,6,80)),i%3===0?cyan:luminous);
    ring.position.set(3.8,2.6,-2.5-i*2.8);tunnel.add(ring);tunnelRings.push(ring);
  }
  const archive=new T.Group();archive.position.set(3.8,3,-47);scene.add(archive);
  const sculpture=new T.Group();archive.add(sculpture);
  const ribbons=[];
  for(let i=0;i<3;i++){
    const mesh=new T.Mesh(own(new T.TorusGeometry(3.2+i*.35,.055,10,130,Math.PI*1.6)),i%2?brass:cyan);
    mesh.rotation.set(i*.8,i*.55,i*.45);sculpture.add(mesh);ribbons.push(mesh);
  }
  const heart=new T.Mesh(own(new T.IcosahedronGeometry(1.15,1)),own(new T.MeshStandardMaterial({color:'#75c9bb',metalness:.7,roughness:.17,wireframe:true})));sculpture.add(heart);
  const shards=[];
  const shardG=own(new T.OctahedronGeometry(.45));
  for(let i=0;i<24;i++){
    const m=new T.Mesh(shardG,brass);const a=i*2.39996,r=4+rand()*3;
    m.userData={a,r,y:(rand()-.5)*8,s:.25+rand()*.7};m.position.set(Math.cos(a)*r,m.userData.y,Math.sin(a)*r);m.scale.setScalar(m.userData.s);sculpture.add(m);shards.push(m);
  }
  const starG=own(new T.BufferGeometry()),stars=[];
  for(let i=0;i<300;i++){stars.push((rand()-.5)*110,rand()*45-1,-rand()*130)}
  starG.setAttribute('position',new T.Float32BufferAttribute(stars,3));
  const starMat=own(new T.PointsMaterial({color:'#bcded8',size:.045,transparent:true,opacity:.15,depthWrite:false}));scene.add(new T.Points(starG,starMat));
  const fogDay=new T.Color('#304e50'),fogNight=new T.Color('#081625'),moonlight=new T.Color('#b8cfff');
  let target=0,progress=0,raf=0,disposed=false,lastTime=0,elapsed=0,mode=0,modeValue=0,galaxyTarget=0,galaxyValue=0;
  const pointer={x:0,y:0},pointerSmoothed={x:0,y:0};
  const look=new T.Vector3(),eye=new T.Vector3();
  function render(now=0){
    if(disposed)return;
    raf=requestAnimationFrame(render);
    const dt=Math.min(.05,(now-lastTime)/1000 || .016);lastTime=now;
    if(document.hidden)return;
    if(!reduced)elapsed+=dt;
    const damping=1-Math.exp(-dt*10);
    progress+= (target-progress)*(reduced?1:damping);
    modeValue+=(mode-modeValue)*damping;
    const pose=cameraPose(progress,mobile(),reduced);
    eye.fromArray(pose.position);look.fromArray(pose.look);
    pointerSmoothed.x+=(pointer.x-pointerSmoothed.x)*damping;pointerSmoothed.y+=(pointer.y-pointerSmoothed.y)*damping;
    const drift=(1-smoothRange(.30,.43,progress))*(reduced?0:1);
    eye.x+=pointerSmoothed.x*.20*drift;eye.y+=pointerSmoothed.y*.12*drift;
    camera.position.copy(eye);camera.lookAt(look);camera.fov=pose.fov;camera.updateProjectionMatrix();
    galaxyValue+=(galaxyTarget-galaxyValue)*(reduced?1:1-Math.exp(-dt*3));
    const night=Math.max(galaxyValue,smoothRange(.28,.48,progress)*(1-smoothRange(.86,1,progress)*.72));
    sky.material.uniforms.uGalaxy.value=galaxyValue;
    sky.material.uniforms.uNight.value=night;sky.material.uniforms.uTime.value=elapsed;sky.material.uniforms.uDawn.value=smoothRange(.88,1,progress);
    scene.fog.color.copy(fogDay).lerp(fogNight,night);scene.fog.density=.010+night*.004;
    ambient.intensity=1.7-night*.8;sunlight.intensity=3-night*2.5;rim.intensity=2.2+night-galaxyValue;
    sunlight.color.set('#ffdfac').lerp(moonlight,galaxyValue);
    water.material.uniforms.uNight.value=night;water.material.uniforms.uTime.value=elapsed;water.material.uniforms.uEye.value.copy(eye);
    starMat.opacity=.06+night*.3;
    const open=reduced?0:smoothRange(.15,.34,progress);
    segments.forEach((m,i)=>{const a=i/count*Math.PI*2;const expansion=Math.sin(open*Math.PI)*1.35;m.position.set(Math.sin(-a)*expansion,Math.cos(a)*expansion,Math.sin(i*1.7)*expansion*.6);m.rotation.z=a+Math.sin(open*Math.PI)*.07;});
    observatory.rotation.y=reduced?0:Math.sin(open*Math.PI)*.6;
    orbit.scale.setScalar(1-smoothRange(.28,.39,progress));
    orbitRings.forEach((m,i)=>{m.rotation.set(.6+i*.8+elapsed*.09,i*.8+elapsed*.07,i*.3)});
    slabs.forEach((m,i)=>{m.rotation.y=-.3+i*.05+Math.sin(open*Math.PI)*i*.065});
    tunnel.visible=progress>.26&&progress<.66&&!reduced;
    tunnelRings.forEach((m,i)=>{m.rotation.z=i*.08;});
    archive.visible=progress>.4||reduced;
    sculpture.rotation.y=(progress-.6)*1.3;
    sculpture.scale.setScalar(.82);
    ribbons.forEach((m,i)=>{m.rotation.x=i*.8+modeValue*.3;m.rotation.y=i*.55+modeValue*(i%2?-.6:.6);m.scale.setScalar(1+modeValue*.12*Math.sin(i))});
    shards.forEach((m,i)=>{const {a,r,y,s}=m.userData;const spread=1+modeValue*.25;m.position.set(Math.cos(a)*r*spread,y,Math.sin(a)*r*spread);m.rotation.set(i,0,modeValue*.6);m.scale.setScalar(s)});
    heart.rotation.y=modeValue*.4;heart.scale.setScalar(1+modeValue*.2);
    bloom.strength=.12+night*.16;
    composer.render();
  }
  const resize=()=>{camera.aspect=innerWidth/innerHeight;renderer.setPixelRatio(pixelRatio());renderer.setSize(innerWidth,innerHeight);composer.setPixelRatio(pixelRatio());composer.setSize(innerWidth,innerHeight)};
  const move=e=>{if(e.pointerType==='touch')return;pointer.x=e.clientX/innerWidth*2-1;pointer.y=1-e.clientY/innerHeight*2};
  const lost=e=>{e.preventDefault();disposed=true;canvas.style.opacity='0';canvas.parentElement.classList.add('world-fallback')};
  addEventListener('resize',resize);addEventListener('pointermove',move);canvas.addEventListener('webglcontextlost',lost);raf=requestAnimationFrame(render);
  return {
    setProgress(value){target=value},setMode(value){mode=value},setNight(value){galaxyTarget=value?1:0},
    destroy(){disposed=true;cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('pointermove',move);canvas.removeEventListener('webglcontextlost',lost);owned.forEach(r=>r.dispose());bloom.dispose();composer.dispose();renderer.dispose()}
  };
}
