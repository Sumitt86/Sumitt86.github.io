import * as icons from 'simple-icons';
import fs from 'node:fs';
const names=['python','react','postgresql','git','docker','javascript','linux','nodedotjs','mongodb','typescript','scikitlearn','tailwindcss','wireshark','burpsuite','owasp','openssl','kalilinux','metasploit','splunk','elasticstack','sonarqubeserver','githubactions'];
fs.mkdirSync('public/icons',{recursive:true});
for(const name of names){const icon=Object.values(icons).find(i=>i.slug===name);if(!icon)throw Error(name);fs.writeFileSync('public/icons/'+name+'.svg',icon.svg.replace('<svg ','<svg fill="#'+(['linux','owasp','openssl','kalilinux','splunk'].includes(name)?'eeeeee':icon.hex)+'" '));}
