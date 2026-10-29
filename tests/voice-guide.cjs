const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const timers=[],spoken=[],elements=new Map(),storage=new Map();let recognizer,watched=0,cleared=0,submitted=0,gps;
const point={lat:48,lon:2};
function element(id){if(!elements.has(id))elements.set(id,{value:id==='destination'?'':id==='origin'?'Ma position':'',textContent:'',classList:{add(){},remove(){}},getAttribute:()=> 'false',setAttribute(){},scrollIntoView(){},focus(){},addEventListener(event,fn){this[event]=fn;},querySelector:()=>element('submit'),requestSubmit(){submitted++;this.submit({preventDefault(){},currentTarget:this});},click(){this.clickHandler?.();}});return elements.get(id);}
const speech={speaking:false,cancel(){this.speaking=false;const previous=this.last;this.last=null;previous?.onerror?.({error:'interrupted'});},speak(utterance){this.last=utterance;this.speaking=true;spoken.push(utterance.text);}};
function Recognition(){recognizer=this;this.start=()=>{this.started=(this.started||0)+1;};this.abort=()=>this.onend?.();this.stop=()=>{};}
const context=vm.createContext({
 active:false,activeRoute:null,activeConversation:false,conversationWaitingForSpeech:false,conversationAwaitingDestination:false,pendingConversationDestination:'',stopConversationAfterReply:false,voiceRouteRequested:false,voiceRoutePending:false,speechEpoch:0,conversationRestartTimer:0,conversationRecognition:undefined,
 guidanceState:'idle',guidanceIndex:0,guidanceSteps:[],guidanceEpoch:0,manualGuidance:false,guideWaypoints:[],watchId:null,rerouting:false,routeGeneration:0,selectedMode:'transit',kidMode:false,destinationCoordinates:point,currentCoordinates:null,
 window:{NavigueNavigationCore:require('../navigation-core.js'),SpeechRecognition:Recognition,speechSynthesis:speech,setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){}},
 navigator:{geolocation:{watchPosition(fn){watched++;gps=fn;return watched;},clearWatch(){cleared++;}}},
 SpeechSynthesisUtterance:function(text){this.text=text;},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
 document:{getElementById:element},uiLanguage:()=> 'fr-FR',uiText:key=>key,chooseSpeechVoice:()=>null,showToast(){},setAssistantMessage(title,detail){context.assistant=detail;},setRouteStatus(){},updateGuidanceButton(){},renderGuidanceSteps(){},updateUserMarker(){},guideText:index=>['Démarrer','Pause','Reprendre','Arrêter','','','','','','Pause','','','','Vous êtes arrivé'][index]||'Manuel',
 currentVoiceInstruction:()=>context.guidanceSteps[context.guidanceIndex]?.title||'Aucune consigne',nearestRouteDistance:()=>0,distanceBetween:()=>0,
 getCurrentPosition:async()=>point,calculateRoute:async()=>({mode:'transit'}),handlePositionUpdate(position){if(context.active&&context.guidanceSteps[context.guidanceIndex]?.kind==='walk')context.advanceGuidance();},
 findRoute:async()=>{context.activeRoute={origin:point};context.guidanceIndex=0;context.guidanceSteps=[{kind:'walk',title:'Continuez sur 100 mètres',target:point},{kind:'wait',title:'Attendez à la gare'},{kind:'board',title:'Montez dans le métro 8'},{kind:'ride',title:'Descendez à Madeleine'},{kind:'walk',title:'Tournez à droite rue Exemple'},{kind:'arrive',title:'Vous êtes arrivé'}];return {mode:'transit'};}
});
function extract(start,end){return html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)));}
vm.runInContext(extract('    function stopGuidance(','    function nearestRouteDistance'),context);
vm.runInContext(extract('    function handlePositionUpdate(','    function updateStreetViewLink'),context);
vm.runInContext(extract('    function speakText(','    function welcomeMessage'),context);
vm.runInContext(extract('    function beginConversationListening(','    function setPendingInstructions'),context);
vm.runInContext(extract('    document.getElementById("journeyForm").addEventListener','    document.getElementById("swapButton")'),context);
vm.runInContext(extract('    async function beginGuidance()','    document.getElementById("voiceButton").addEventListener'),context);
function finish(){const utterance=speech.last;speech.last=null;speech.speaking=false;utterance?.onend();}
async function flush(){for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));}
function runTimers(){const pending=timers.splice(0);pending.forEach(fn=>fn());}
function say(text){recognizer.onresult({results:[[{transcript:text}]]});}
(async()=>{
 context.startConversation();assert.equal(storage.get('navigueVoiceEnabled'),'true');assert.equal(context.conversationAwaitingDestination,true);
 finish();runTimers();assert.equal(recognizer.started,1);
 say('Bonjour');assert.equal(submitted,0,'greeting never becomes destination');finish();runTimers();
 say('24 rue Exemple Paris');assert.equal(element('destination').value,'24 rue Exemple Paris');assert.equal(context.voiceRoutePending,true);
 say('texte parasite');assert.equal(element('destination').value,'24 rue Exemple Paris','ignore recognition while replying');
 runTimers();await flush();assert.equal(submitted,1);assert.equal(context.active,true,'spoken address automatically starts guidance');assert.equal(watched,1);assert.equal(context.voiceRoutePending,false);assert.equal(spoken.at(-1),'Continuez sur 100 mètres');
 finish();runTimers();gps({timestamp:Date.now(),coords:{latitude:48,longitude:2,accuracy:5}});assert.equal(context.guidanceIndex,1);assert.equal(spoken.at(-1),'Attendez à la gare');
 finish();runTimers();say('Je suis monté');assert.equal(context.guidanceIndex,3);assert.equal(spoken.at(-1),'Descendez à Madeleine');
 finish();runTimers();say('Étape suivante');assert.equal(context.guidanceIndex,3,'next does not invent alighting');assert.match(spoken.at(-1),/descendu/);
 finish();runTimers();say('Je suis descendu');assert.equal(context.guidanceIndex,4);assert.equal(spoken.at(-1),'Tournez à droite rue Exemple');
 finish();runTimers();say('Pause');assert.equal(context.active,false);assert.equal(context.guidanceIndex,4);assert.equal(cleared,1);
 finish();runTimers();say('Reprends');runTimers();await flush();assert.equal(context.active,true);assert.equal(context.guidanceIndex,4,'resume retains current step');
 finish();runTimers();say('Répète');assert.equal(spoken.at(-1),'Tournez à droite rue Exemple');
 finish();runTimers();say('Arrête la navigation');assert.equal(context.active,false);assert.ok(context.activeRoute,'stopping retains preview');
 const stale=speech.last;context.speakText('Dernière consigne');stale.onend();assert.equal(context.conversationWaitingForSpeech,true,'a cancelled utterance cannot reopen the microphone');
 finish();assert.equal(context.conversationWaitingForSpeech,false);
 const before=submitted;context.conversationAwaitingDestination=true;context.handleConversationInput('Versailles');context.stopConversation();runTimers();await flush();assert.equal(submitted,before,'stopping cancels a queued spoken route');
 context.getCurrentPosition=async()=>{throw Error('Position refusée');};context.startConversation();await flush();assert.equal(context.active,false);assert.equal(context.voiceRoutePending,false);assert.match(spoken.at(-1),/guidage manuel/,'GPS refusal is explained aloud');
 finish();runTimers();say('Guidage manuel');assert.equal(context.active,true);assert.equal(context.manualGuidance,true,'manual voice fallback remains usable without GPS');
 console.log('PASS: spoken destination → route → GPS guidance; echo protection, boarding/alighting, next, repeat, pause/resume and stop');
})().catch(error=>{console.error(error);process.exitCode=1;});
