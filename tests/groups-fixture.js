// Offline UI harness. It cannot activate against a hosted production domain.
(() => {
  if (!['127.0.0.1','localhost'].includes(location.hostname)) return;
  const user='11111111-1111-4111-8111-111111111111', friend='22222222-2222-4222-8222-222222222222',group='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const now=()=>new Date().toISOString();
  const tables={
    travel_groups:[{id:group,owner_id:user,name:'Madrid — groupe de test',destination:'Madrid',travel_date:'2026-11-20',description:'Voyage de test local',created_at:now()}],
    travel_members:[{group_id:group,user_id:user,nickname:'Alice (test)',joined_at:now()},{group_id:group,user_id:friend,nickname:'Bob (test)',joined_at:now()}],
    travel_messages:[{id:'test-message',group_id:group,user_id:friend,body:'Bienvenue dans le test de discussion.',created_at:now()}], travel_locations:[],travel_media:[]
  };
  const log=message=>document.getElementById('testEvents').textContent+=message+'\n';
  class Query {
    constructor(table){this.table=table;this.action='read';this.filters=[];}
    select(){return this;} order(key,options={}){this.sortKey=key;this.ascending=options.ascending!==false;return this;} limit(){return this;} single(){this.one=true;return this;}
    eq(key,value){this.filters.push(row=>row[key]===value);return this;}
    insert(value){this.action='insert';this.value=value;return this;}
    update(value){this.action='update';this.value=value;return this;}
    delete(){this.action='delete';return this;}
    then(resolve,reject){return Promise.resolve().then(()=>{
      let rows=tables[this.table]||[],found=rows.filter(row=>this.filters.every(fn=>fn(row)));if(this.sortKey)found.sort((a,b)=>String(a[this.sortKey]).localeCompare(String(b[this.sortKey]))*(this.ascending?1:-1));
      if(this.action==='insert'){const row={id:crypto.randomUUID(),created_at:now(),...this.value};rows.push(row);log('INSERT '+this.table);return {data:row,error:null};}
      if(this.action==='update'){found.forEach(row=>Object.assign(row,this.value));return {data:found,error:null};}
      if(this.action==='delete'){tables[this.table]=rows.filter(row=>!found.includes(row));log('DELETE '+this.table);return {data:null,error:null};}
      return {data:this.one?found[0]:structuredClone(found),error:null};
    }).then(resolve,reject);}
  }
  const client={
    from:table=>new Query(table),
    channel:()=>({on(){return this;},subscribe(fn){fn('SUBSCRIBED');return this;}}),removeChannel:async()=>{},
    rpc:async(name,args)=>{
      log('RPC '+name);
      if(name==='travel_invite')return {data:'abcdef0123456789abcdef0123456789',error:null};
      if(name==='travel_share_location'){tables.travel_locations=[{group_id:args.g,user_id:user,lat:args.latitude,lon:args.longitude,accuracy:args.precision_m,updated_at:now(),expires_at:new Date(Date.now()+90000).toISOString()}];return {data:null,error:null};}
      if(name==='travel_remove_member'){tables.travel_members=tables.travel_members.filter(m=>m.user_id!==args.member_id);return {data:null,error:null};}
      return {data:null,error:null};
    }, storage:{from:()=>({upload:async()=>({data:{},error:null}),remove:async()=>({data:{},error:null}),download:async()=>({data:new Blob(['test'],{type:'image/png'}),error:null})})}
  };
  let timer=null;
  Object.defineProperty(navigator,'geolocation',{configurable:true,value:{watchPosition(callback){log('GPS SIMULÉ démarré');timer=setTimeout(()=>callback({coords:{latitude:40.4168,longitude:-3.7038,accuracy:15},timestamp:Date.now()}),20);return 1;},clearWatch(){clearTimeout(timer);log('GPS SIMULÉ arrêté');}}});
  window.NavigueFamilyAuth={client,userId:user,signedIn:true,displayName:'Alice',openAccount(){log('OPEN ACCOUNT');}};
  window.NavigueGuide={isChild:()=>false};
  document.getElementById('testLanguage').addEventListener('change',event=>{localStorage.setItem('navigueLanguage',event.target.value);document.dispatchEvent(new Event('navigue:language'));});
})();
