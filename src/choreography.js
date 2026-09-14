export const smoothRange = (a,b,value) => {
  const t=Math.max(0,Math.min(1,(value-a)/(b-a)));
  return t*t*(3-2*t);
};
const shots = [
  {p:0, position:[.1,3.5,23],look:[.4,1.1,0],fov:42},
  {p:.16,position:[-6,4,15],look:[3.8,2.6,0],fov:44},
  {p:.30,position:[5,4,12],look:[3.8,2.6,0],fov:42},
  {p:.38,position:[3.8,2.6,6],look:[3.8,2.6,-15],fov:44},
  {p:.48,position:[3.8,2.6,-12],look:[3.8,2.6,-45],fov:58},
  {p:.58,position:[3.8,3,-32],look:[3.8,3,-47],fov:47},
  {p:.72,position:[-7,5,-32],look:[4.5,3,-47],fov:46},
  {p:.84,position:[-6,9,-31],look:[3.8,3,-47],fov:48},
  {p:1,position:[-4,20,-15],look:[8,0,-47],fov:47}
];
export function cameraPose(progress,mobile=false,reduced=false){
  const p=Math.max(0,Math.min(1,progress));
  if(reduced)return {position:mobile?[.1,7,35]:[.1,3.5,23],look:mobile?[3.8,5.8,0]:[.4,1.1,0],fov:42};
  const j=shots.findIndex(s=>s.p>=p);
  const b=shots[Math.max(1,j)],a=shots[Math.max(0,j-1)];
  const t=smoothRange(a.p,b.p,p);
  const lerp=(x,y)=>x+(y-x)*t;
  const position=a.position.map((x,i)=>lerp(x,b.position[i]));
  const look=a.look.map((x,i)=>lerp(x,b.look[i]));
  if(mobile){
    const opening=1-smoothRange(.10,.30,p);
    position[2]+=opening*13;
    look[0]+=opening*3.1;
    look[1]+=opening*5.0;
    if(p>.58){position[2]+=smoothRange(.58,.68,p)*5;look[1]+=smoothRange(.58,.68,p)*2;}
  }
  return {position,look,fov:lerp(a.fov,b.fov)};
}
// Map actual section positions to story time so phone layout cannot desynchronize the scene.
export function storyProgress(scrollY, landmarks){
  if(scrollY<=landmarks[0].y)return 0;
  for(let i=1;i<landmarks.length;i++){
    if(scrollY<=landmarks[i].y){const a=landmarks[i-1],b=landmarks[i];return a.p+(b.p-a.p)*(scrollY-a.y)/Math.max(1,b.y-a.y);}
  }
  return 1;
}
