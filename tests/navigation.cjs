const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../navigation-core.js');
const time=n=>new Date(Date.UTC(2026,9,28,12,n)).toISOString();
const itinerary={legs:[
  {mode:'WALK',from:{lat:48,lon:2,name:'Départ'},to:{lat:48.001,lon:2,name:'Métro'},distance:200,duration:180,startTime:time(0),endTime:time(3),steps:[{relativeDirection:'RIGHT',streetName:'Rue de test',distance:200}]},
  {mode:'SUBWAY',from:{name:'Métro'},to:{name:'Correspondance'},routeShortName:'1',startTime:time(5),endTime:time(15),duration:600},
  {mode:'WALK',from:{name:'Correspondance'},to:{name:'Bus'},distance:150,duration:120,startTime:time(15),endTime:time(17)},
  {mode:'BUS',from:{name:'Bus'},to:{name:'Arrêt final'},routeShortName:'42',startTime:time(20),endTime:time(30),duration:600},
  {mode:'WALK',from:{name:'Arrêt final'},to:{name:'Destination',lat:48.01,lon:2.01},distance:300,duration:240,startTime:time(30),endTime:time(34)}
]};
for(const lang of ['fr-FR','en-US','es-ES','de-DE','zh-CN']){
 const steps=core.transitSteps(itinerary,lang);
 assert.equal(steps.filter(s=>s.kind==='walk').length,3,'access, transfer and egress walks');
 assert.equal(steps.filter(s=>s.kind==='wait').length,2);
 assert.equal(steps.filter(s=>s.kind==='board').length,2);
 assert.equal(steps.at(-1).kind,'arrive');
 assert.ok(steps.every(s=>typeof s.title==='string'&&s.title.length));
}
assert.deepEqual(core.decode('invalid'),[]);
const at={lat:48,lon:2};
assert.equal(core.canAdvance({kind:'board',target:at},at,5,()=>0),false,'never infer boarding from GPS');
assert.equal(core.canAdvance({kind:'ride',target:at},at,5,()=>0),false,'never infer alighting from GPS');
assert.equal(core.canAdvance({kind:'walk',target:at},at,100,()=>0),false,'ignore inaccurate fixes');
assert.equal(core.canAdvance({kind:'walk',target:at},at,5,()=>0),true);

// Exercise the real start/pause/stop handlers with deferred GPS, no real permission or position.
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const callbacks={},elements=new Map();let resolveGPS,watchCount=0,cleared=0;
function element(id){if(!elements.has(id))elements.set(id,{classList:{add(){},remove(){}},addEventListener(event,fn){callbacks[`${id}:${event}`]=fn;}});return elements.get(id);}
const context=vm.createContext({
 active:false,activeRoute:{origin:at},destinationCoordinates:at,currentCoordinates:null,watchId:null,rerouting:false,routeGeneration:0,guidanceEpoch:0,guidanceState:'idle',guidanceIndex:0,guidanceSteps:[],selectedMode:'transit',
 document:{getElementById:element},navigator:{geolocation:{watchPosition(){watchCount++;return watchCount;},clearWatch(){cleared++;}}},window:{speechSynthesis:{cancel(){}}},
 localStorage:{getItem:()=>null},updateGuidanceButton(){},renderGuidanceSteps(){},updateUserMarker(){},setRouteStatus(){},guideText:()=>'',currentVoiceInstruction:()=>'',speakText(){},
 getCurrentPosition:()=>new Promise(resolve=>resolveGPS=resolve),distanceBetween:()=>0,nearestRouteDistance:()=>0,calculateRoute:async()=>({}),handlePositionUpdate(){},advanceGuidance(){}
});
vm.runInContext(html.slice(html.indexOf('    function stopGuidance('),html.indexOf('    function advanceGuidance(')),context);
vm.runInContext(html.slice(html.indexOf('    async function beginGuidance()'),html.indexOf('    document.getElementById("voiceButton").addEventListener')),context);
(async()=>{
 const starting=callbacks['startButton:click']();
 assert.equal(context.guidanceState,'starting');
 callbacks['stopGuideButton:click']();resolveGPS(at);await starting;
 assert.equal(context.active,false);assert.equal(watchCount,0,'stopping pending GPS must not restart guidance');
 let run=callbacks['startButton:click']();resolveGPS(at);await run;
 assert.equal(context.active,true);assert.equal(watchCount,1,'transit navigation must watch GPS');
 context.guidanceIndex=3;await callbacks['startButton:click']();
 assert.equal(context.guidanceState,'paused');assert.equal(context.guidanceIndex,3);assert.equal(cleared,1);
 run=callbacks['startButton:click']();resolveGPS(at);await run;assert.equal(context.active,true);
 callbacks['stopGuideButton:click']();assert.equal(context.guidanceIndex,0);assert.ok(context.activeRoute,'stop retains preview');
 console.log('PASS: complete transit legs and waits, manual boarding, GPS precision, start cancellation, pause/resume and independent stop');
})().catch(error=>{console.error(error);process.exitCode=1;});
