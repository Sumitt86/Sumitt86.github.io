import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraPose,storyProgress} from './choreography.js';

test('camera advances through the aperture and tunnel without reversing',()=>{
  let previous=Infinity;
  for(let p=.34;p<=.58;p+=.001){const pose=cameraPose(p);assert.ok(pose.position[2]<=previous+1e-8);previous=pose.position[2];assert.ok(pose.look[2]<pose.position[2]);}
  assert.ok(cameraPose(.58).position[2]<-30);
});
test('all camera paths remain finite and continuous, including boundaries',()=>{
  for(const mobile of [false,true]){
    let previous=cameraPose(0,mobile);
    for(let i=1;i<=1000;i++){
      const pose=cameraPose(i/1000,mobile);
      [...pose.position,...pose.look,pose.fov].forEach(n=>assert.ok(Number.isFinite(n)));
      assert.ok(Math.hypot(...pose.position.map((n,j)=>n-previous.position[j]))<.6);
      previous=pose;
    }
  }
});
test('reduced motion has a stable camera across the full story',()=>{
  for(const mobile of [false,true])for(const p of [0,.2,.45,.7,1])assert.deepEqual(cameraPose(p,mobile,true),cameraPose(0,mobile,true));
});
test('story landmarks remain aligned when mobile chapters change height',()=>{
  for(const heights of [[0,1000,2300,3800,5300,6500],[0,900,2100,3500,6000,7100]]){
    const stages=[0,.16,.34,.58,.84,1].map((p,i)=>({p,y:heights[i]}));
    stages.forEach(({p,y})=>assert.equal(storyProgress(y,stages),p));
    assert.equal(storyProgress(-1,stages),0);assert.equal(storyProgress(99999,stages),1);
  }
});
