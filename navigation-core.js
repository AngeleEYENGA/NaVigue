(function(root){
  'use strict';
  const languages=['fr-FR','en-US','es-ES','de-DE','zh-CN'];
  const copy={
    walk:['Marchez jusqu’à','Walk to','Camina hasta','Gehe zu','步行前往'], wait:['Attendez le départ','Wait for departure','Espera la salida','Auf Abfahrt warten','等待发车'], board:['Montez à bord','Board','Sube a bordo','Einsteigen','上车'], ride:['Descendez à','Get off at','Baja en','Aussteigen in','在此下车：'], arrive:['Vous êtes arrivé·e','You have arrived','Has llegado','Du bist angekommen','已到达'],
    straight:['Continuez','Continue','Continúa','Weiter','继续前进'],left:['Tournez à gauche','Turn left','Gira a la izquierda','Links abbiegen','左转'],right:['Tournez à droite','Turn right','Gira a la derecha','Rechts abbiegen','右转'],slightLeft:['Prenez légèrement à gauche','Bear left','Gira ligeramente a la izquierda','Leicht links halten','稍向左转'],slightRight:['Prenez légèrement à droite','Bear right','Gira ligeramente a la derecha','Leicht rechts halten','稍向右转'],stairs:['Prenez les escaliers','Take the stairs','Toma las escaleras','Treppe nehmen','走楼梯'],destination:['Destination','Destination','Destino','Ziel','目的地'], line:['ligne','line','línea','Linie','线路'], direction:['direction','towards','dirección','Richtung','方向'], walkMode:['À pied','Walking','A pie','Zu Fuß','步行']
  };
  const word=(key,lang)=>copy[key]?.[Math.max(0,languages.indexOf(lang))]||copy[key]?.[0]||key;
  function decode(encoded,precision=6){
    if(typeof encoded!=='string')return[];let i=0,lat=0,lon=0;const out=[],factor=10**precision;
    function delta(){let value=0,shift=0,byte;do{if(i>=encoded.length||shift>30)throw Error('polyline');byte=encoded.charCodeAt(i++)-63;if(byte<0||byte>63)throw Error('polyline');value|=(byte&31)<<shift;shift+=5;}while(byte>=32);return value&1?~(value>>1):value>>1;}
    try{while(i<encoded.length){lat+=delta();lon+=delta();out.push([lat/factor,lon/factor]);}}catch{return[];}return out;
  }
  const point=p=>Number.isFinite(p?.lat)&&Number.isFinite(p?.lon)?{lat:p.lat,lon:p.lon}:null;
  const endOf=(geometry,fallback)=>{const pts=geometry?.points?decode(geometry.points,geometry.precision||6):[];return pts.length?{lat:pts.at(-1)[0],lon:pts.at(-1)[1]}:point(fallback);};
  function turn(direction,lang){const key=({LEFT:'left',RIGHT:'right',SLIGHTLY_LEFT:'slightLeft',SLIGHTLY_RIGHT:'slightRight',SHARP_LEFT:'left',SHARP_RIGHT:'right',STAIRS:'stairs'})[direction]||'straight';return word(key,lang);}
  function bearing(a,b){const rad=Math.PI/180,lat1=a[0]*rad,lat2=b[0]*rad,delta=(b[1]-a[1])*rad;return Math.atan2(Math.sin(delta)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(delta))*180/Math.PI;}
  function edgeBearing(points,last=false){
    if(points.length<2)return null;
    const anchor=last?points.at(-1):points[0],candidates=last?points.slice(0,-1).reverse():points.slice(1);
    for(const p of candidates){const meters=Math.hypot((p[0]-anchor[0])*111195,(p[1]-anchor[1])*111195*Math.cos(anchor[0]*Math.PI/180));if(meters>=2)return last?bearing(p,anchor):bearing(anchor,p);}
    return null;
  }
  function walkingSteps(leg){
    const raw=(leg.steps||[]).filter(step=>Number.isFinite(step.distance)&&step.distance>0),infer=!raw.some(step=>['LEFT','RIGHT','SLIGHTLY_LEFT','SLIGHTLY_RIGHT','SHARP_LEFT','SHARP_RIGHT','UTURN_LEFT','UTURN_RIGHT'].includes(step.relativeDirection));
    let incoming=null;const merged=[];
    for(const step of raw){
      const points=decode(step.polyline?.points,step.polyline?.precision||6),outgoing=edgeBearing(points),ending=edgeBearing(points,true);
      let direction=step.relativeDirection||'CONTINUE';
      if(infer&&direction==='CONTINUE'&&incoming!==null&&outgoing!==null){const angle=(outgoing-incoming+540)%360-180;if(Math.abs(angle)>=30)direction=Math.abs(angle)>=150?'UTURN':Math.abs(angle)<60?(angle>0?'SLIGHTLY_RIGHT':'SLIGHTLY_LEFT'):(angle>0?'RIGHT':'LEFT');}
      if(ending!==null)incoming=ending;
      const previous=merged.at(-1),target=endOf(step.polyline);
      if(previous&&direction==='CONTINUE'&&!step.exit&&!previous.exit&&!['STAIRS','ELEVATOR','ESCALATOR'].includes(previous.relativeDirection)&&previous.fromLevel===previous.toLevel&&(step.streetName||'')===(previous.streetName||'')&&step.fromLevel===previous.toLevel){previous.distance+=step.distance;previous.target=target||previous.target;previous.toLevel=step.toLevel;}
      else merged.push({...step,relativeDirection:direction,target});
    }
    return merged;
  }
  const streetCache=new Map();
  async function fillStreetNames(itinerary,fetcher=fetch){
    const steps=(itinerary?.legs||[]).filter(leg=>leg.mode==='WALK').flatMap(leg=>leg.steps||[]);
    const ids=[...new Set(steps.filter(step=>!step.streetName&&Number.isSafeInteger(step.osmWay)&&step.osmWay>0).map(step=>step.osmWay))].slice(0,150);
    const missing=ids.filter(id=>!streetCache.has(id));
    if(missing.length){
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
      try{
        const query=`[out:json][timeout:8];way(id:${missing.join(',')});out tags;`;
        const response=await fetcher(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,{signal:controller.signal});if(!response.ok)throw Error('street names');
        const data=await response.json();for(const element of data.elements||[]){if(element.type==='way'&&missing.includes(element.id))streetCache.set(element.id,element.tags?.name||'');}
        while(streetCache.size>500)streetCache.delete(streetCache.keys().next().value);
      }catch{return itinerary;}finally{clearTimeout(timeout);}
    }
    return {...itinerary,legs:itinerary.legs.map(leg=>leg.mode!=='WALK'?leg:{...leg,steps:(leg.steps||[]).map(step=>({...step,streetName:step.streetName||streetCache.get(step.osmWay)||''}))})};
  }
  function transitSteps(itinerary,lang='fr-FR',labels={}){
    const result=[],legs=itinerary?.legs||[];
    legs.forEach((leg,index)=>{
      const to=(!leg.to?.name||leg.to.name==='END')?(labels.destination||word('destination',lang)):leg.to.name,from=leg.from?.name||'',times=[leg.startTime,leg.endTime].filter(Boolean).map(time=>new Date(time).toLocaleTimeString(lang,{hour:'2-digit',minute:'2-digit'})).join(' – ');
      if(leg.mode==='WALK'){
        const phase=`${word('walk',lang)} ${to}`;
        const steps=walkingSteps(leg);
        if(steps.length){
          const exitWord=['Prenez la sortie','Take exit','Toma la salida','Ausgang nehmen','出口'],around=['Faites demi-tour','Turn around','Da la vuelta','Umkehren','掉头'];
          steps.forEach(step=>{const points=decode(step.polyline?.points,step.polyline?.precision||6);result.push({kind:'walk',title:`${step.exit?`${exitWord[Math.max(0,languages.indexOf(lang))]} ${step.exit}`:step.relativeDirection==='UTURN'?around[Math.max(0,languages.indexOf(lang))]:turn(step.relativeDirection,lang)}${step.streetName?` · ${step.streetName}`:''}`,detail:`${Math.round(step.distance)} m · ${phase}`,distance:step.distance,start:points.length?{lat:points[0][0],lon:points[0][1]}:null,target:step.target,leg:index});});
        }
        else result.push({kind:'walk',title:phase,detail:`${Math.round(leg.distance||0)} m · ${Math.ceil((leg.duration||0)/60)} min · ${['Consignes détaillées non fournies pour cette portion','Detailed directions unavailable for this section','Indicaciones detalladas no disponibles en este tramo','Keine Detailanweisungen für diesen Abschnitt','此路段暂无详细指引'][Math.max(0,languages.indexOf(lang))]}`,target:endOf(leg.legGeometry,leg.to),leg:index});
      }else{
        const prev=legs[index-1],gap=prev?(Date.parse(leg.startTime)-Date.parse(prev.endTime))/60000:0;
        if(leg.startTime)result.push({kind:'wait',title:`${word('wait',lang)} · ${from}`,detail:`${gap>=1?`${Math.round(gap)} min · `:''}${new Date(leg.startTime).toLocaleTimeString(lang,{hour:'2-digit',minute:'2-digit'})}`,target:null,leg:index});
        const line=leg.routeShortName||leg.displayName||leg.mode;
        result.push({kind:'board',title:`${word('board',lang)} · ${line}`,detail:`${from}${leg.headsign?` · ${word('direction',lang)} ${leg.headsign}`:''} · ${times}`,target:null,leg:index});
        result.push({kind:'ride',title:`${word('ride',lang)} ${to}`,detail:`${line} · ${Math.ceil((leg.duration||0)/60)} min · ${times}`,target:null,leg:index});
      }
    });
    const last=legs.at(-1);result.push({kind:'arrive',title:word('arrive',lang),detail:!last?.to?.name||last.to.name==='END'?(labels.destination||word('destination',lang)):last.to.name,target:point(last?.to),leg:legs.length});return result;
  }
  function canAdvance(step,position,accuracy,distance){
    if(!['walk','arrive'].includes(step?.kind)||!step.target||!Number.isFinite(accuracy)||accuracy>50)return false;
    if(step.kind==='walk'&&step.start){const span=distance(step.start,step.target);if(span<Math.max(8,accuracy*1.5)||distance(position,step.start)<span*.6)return false;}
    return distance(position,step.target)<=Math.max(5,Math.min(12,accuracy));
  }
  const api={decode,transitSteps,walkingSteps,fillStreetNames,canAdvance,turn};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NavigueNavigationCore=api;
})(typeof window!=='undefined'?window:globalThis);
