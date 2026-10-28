(() => {
  'use strict';
  const auth=window.NavigueFamilyAuth, core=window.NavigueGroupsCore;
  if(!auth || !core) return;
  const translations={
    title:['Mes groupes de voyage','My travel groups','Mis grupos de viaje','Meine Reisegruppen','我的旅行群组'],
    close:['Fermer','Close','Cerrar','Schließen','关闭'], login:['Se connecter au compte adulte','Sign in to an adult account','Iniciar sesión de adulto','Mit Erwachsenenkonto anmelden','登录成人账户'],
    loginNote:['Connectez-vous pour créer ou rejoindre un groupe privé.','Sign in to create or join a private group.','Conéctate para crear o unirte a un grupo privado.','Melde dich an, um einer privaten Gruppe beizutreten.','请登录以创建或加入私人群组。'],
    nickname:['Votre prénom dans le groupe','Your name in the group','Tu nombre en el grupo','Dein Name in der Gruppe','群内昵称'], create:['Créer un groupe','Create group','Crear grupo','Gruppe erstellen','创建群组'], name:['Nom du groupe','Group name','Nombre del grupo','Gruppenname','群组名称'],
    join:['Rejoindre un groupe','Join group','Unirse a un grupo','Gruppe beitreten','加入群组'], code:['Code d’invitation','Invitation code','Código de invitación','Einladungscode','邀请码'], empty:['Aucun groupe pour le moment.','No groups yet.','Aún no hay grupos.','Noch keine Gruppen.','暂无群组。'],
    chat:['Discussion','Chat','Chat','Chat','聊天'], map:['Positions en direct','Live locations','Ubicaciones en directo','Live-Standorte','实时位置'], gallery:['Galerie','Gallery','Galería','Galerie','相册'], trip:['Voyage et membres','Trip and members','Viaje y miembros','Reise und Mitglieder','旅行及成员'],
    send:['Envoyer','Send','Enviar','Senden','发送'], message:['Votre message','Your message','Tu mensaje','Deine Nachricht','消息内容'], noMessages:['Commencez la discussion.','Start the conversation.','Inicia la conversación.','Starte den Chat.','开始聊天吧。'],
    consent:['Je partage ma position avec tous les membres de ce groupe pendant 1 heure maximum. Je peux arrêter à tout moment.','Share my location with all group members for up to 1 hour. I can stop at any time.','Compartir mi ubicación con el grupo durante 1 hora como máximo. Puedo detenerlo cuando quiera.','Meinen Standort bis zu 1 Stunde mit allen Gruppenmitgliedern teilen. Jederzeit beendbar.','最多1小时向所有群成员共享位置，随时可停止。'],
    start:['Partager ma position','Share my location','Compartir mi ubicación','Standort teilen','共享我的位置'], stop:['Arrêter le partage','Stop sharing','Dejar de compartir','Teilen beenden','停止共享'],
    locationNote:['Seuls les membres ayant activé le partage apparaissent. Les points expirent après 90 s sans mise à jour. Fermer cet espace, masquer la page ou changer de groupe arrête votre partage.','Only members who enabled sharing appear. Points expire after 90 s without updates. Closing this panel, hiding the page or switching groups stops sharing.','Solo aparecen quienes comparten. Los puntos caducan tras 90 s sin actualizar. Cerrar, ocultar la página o cambiar de grupo detiene el uso compartido.','Nur freiwillig geteilte Standorte erscheinen. Nach 90 s ohne Aktualisierung verschwinden sie. Schließen, Seitenwechsel oder Gruppenwechsel beendet das Teilen.','仅显示主动共享位置的成员。90秒未更新的位置会消失。关闭面板、隐藏页面或切换群组将停止共享。'],
    sharing:['Partage actif — gardez cette page ouverte.','Sharing active — keep this page open.','Compartiendo: mantén esta página abierta.','Teilen aktiv — Seite offen halten.','正在共享，请保持页面打开。'],
    stopped:['Partage arrêté. Si le réseau est coupé, le dernier point expire sous 90 s.','Sharing stopped. If offline, the last point expires within 90 s.','Uso compartido detenido. Sin conexión, el último punto caduca en 90 s.','Teilen beendet. Offline verfällt der letzte Punkt binnen 90 s.','已停止共享。断网时最后位置将在90秒内失效。'],
    permission:['Position indisponible ou autorisation refusée. Le partage est arrêté.','Location unavailable or permission denied. Sharing stopped.','Ubicación no disponible o permiso denegado. Se ha detenido el uso compartido.','Standort nicht verfügbar oder Zugriff verweigert. Teilen beendet.','位置不可用或未获授权，已停止共享。'],
    nobody:['Aucune position en direct.','No live locations.','Sin ubicaciones en directo.','Keine Live-Standorte.','暂无实时位置。'],
    invite:['Générer une invitation privée (7 jours)','Generate private invitation (7 days)','Generar invitación privada (7 días)','Private Einladung erstellen (7 Tage)','生成私人邀请（7天）'],
    inviteNote:['Ce code permet de rejoindre le groupe. Transmettez-le uniquement aux personnes choisies. Une nouvelle invitation invalide l’ancienne.','This code grants group membership. Share it only with chosen people. A new invitation invalidates the previous one.','Este código permite unirse al grupo. Compártelo solo con personas elegidas. Una nueva invitación invalida la anterior.','Dieser Code erlaubt den Gruppenbeitritt. Nur ausgewählten Personen geben. Ein neuer Code ersetzt den alten.','此邀请码可用于加入群组，请只发给选定的人。新邀请码会使旧码失效。'],
    destination:['Destination du groupe','Group destination','Destino del grupo','Reiseziel der Gruppe','群组目的地'], date:['Date de départ','Departure date','Fecha de salida','Abreisedatum','出发日期'], description:['Programme et organisation','Plans and organisation','Programa y organización','Programm und Organisation','行程安排'], save:['Enregistrer le voyage','Save trip','Guardar viaje','Reise speichern','保存行程'],
    leave:['Quitter ce groupe','Leave group','Salir del grupo','Gruppe verlassen','退出群组'], leaveNote:['Vos messages et médias déjà partagés restent dans le groupe.','Previously shared messages and media remain in the group.','Los mensajes y medios ya compartidos permanecen en el grupo.','Bereits geteilte Nachrichten und Medien bleiben in der Gruppe.','已共享的消息和媒体将保留在群组中。'], remove:['Retirer du groupe','Remove from group','Quitar del grupo','Aus Gruppe entfernen','移出群组'],
    photo:['Prendre une photo','Take a photo','Hacer una foto','Foto aufnehmen','拍照'], video:['Prendre une vidéo','Record video','Grabar vídeo','Video aufnehmen','录制视频'], choose:['Choisir une photo ou vidéo','Choose photo or video','Elegir foto o vídeo','Foto oder Video auswählen','选择照片或视频'], caption:['Légende (facultative)','Caption (optional)','Descripción (opcional)','Beschreibung (optional)','说明（可选）'], upload:['Partager dans ce groupe','Share with this group','Compartir con este grupo','Mit dieser Gruppe teilen','分享到本群'],
    mediaNote:['Photos et vidéos privées au groupe, 50 Mo maximum. La capture dépend du téléphone et du navigateur. Sélectionnez un média, vérifiez l’aperçu puis partagez-le.','Group-private photos and videos, up to 50 MB. Capture depends on your device and browser. Select media, check the preview, then share.','Fotos y vídeos privados del grupo, hasta 50 MB. La captura depende del dispositivo. Revisa la vista previa antes de compartir.','Private Gruppenfotos und -videos, bis 50 MB. Aufnahme abhängig vom Gerät. Vorschau vor dem Teilen prüfen.','群内私人照片和视频，最大50MB。拍摄取决于设备及浏览器，请预览后再分享。'],
    noMedia:['Aucun média partagé.','No shared media.','No hay archivos compartidos.','Keine geteilten Medien.','暂无共享媒体。'], open:['Voir','View','Ver','Ansehen','查看'], delete:['Supprimer mon média','Delete my media','Eliminar mi archivo','Mein Medium löschen','删除我的媒体'],
    invalid:['Fichier non pris en charge ou supérieur à 50 Mo.','Unsupported file or larger than 50 MB.','Archivo no compatible o superior a 50 MB.','Datei nicht unterstützt oder größer als 50 MB.','文件类型不支持或超过50MB。'],
    deleted:['Média supprimé.','Media deleted.','Archivo eliminado.','Medium gelöscht.','媒体已删除。'], saved:['Enregistré.','Saved.','Guardado.','Gespeichert.','已保存。'], uploading:['Envoi du média…','Uploading media…','Enviando archivo…','Medium wird hochgeladen…','正在上传媒体……'],
    setup:['Les groupes ne sont pas encore activés sur ce serveur. L’administrateur doit appliquer la configuration des groupes avant leur utilisation.','Groups are not enabled on this server yet. The administrator must apply the groups configuration.','Los grupos aún no están activados en este servidor. El administrador debe configurarlos.','Gruppen sind auf diesem Server noch nicht eingerichtet. Die Administration muss sie aktivieren.','服务器尚未启用群组功能，请管理员完成配置。'],
    error:['Action impossible. Vérifiez votre connexion et votre accès au groupe.','Could not complete the action. Check your connection and group access.','No se pudo completar. Comprueba la conexión y tu acceso al grupo.','Aktion fehlgeschlagen. Verbindung und Gruppenzugang prüfen.','操作失败，请检查网络连接及群组权限。'],
    refresh:['Actualiser','Refresh','Actualizar','Aktualisieren','刷新'], oldMember:['Ancien membre','Former member','Antiguo miembro','Ehemaliges Mitglied','原成员'], child:['Les groupes sont réservés au compte adulte.','Groups are for adult accounts.','Los grupos requieren una cuenta de adulto.','Gruppen sind für Erwachsenenkonten.','群组仅供成人账户使用。'], realtime:['Connexion en direct interrompue : actualisation périodique active.','Live connection interrupted: periodic refresh active.','Conexión en directo interrumpida: actualización periódica activa.','Live-Verbindung unterbrochen: regelmäßige Aktualisierung aktiv.','实时连接中断，已启用定期刷新。']
  };
  const language=()=>localStorage.getItem('navigueLanguage')||'fr-FR';
  const t=key=>(translations[key]||[key])[Math.max(0,['fr-FR','en-US','es-ES','de-DE','zh-CN'].indexOf(language()))]||translations[key]?.[0]||key;
  const el=(tag,text,cls)=>{const n=document.createElement(tag); if(text)n.textContent=text; if(cls)n.className=cls; return n;};
  const btn=(text,fn)=>{const b=el('button',text,'secondary-button');b.type='button';if(fn)b.addEventListener('click',()=>Promise.resolve().then(fn).catch(fail));return b;};
  const text=(tag,key,cls)=>{const n=el(tag,tag==='label'?'':t(key),cls);if(tag==='label'){const span=el('span',t(key));span.dataset.groupI18n=key;n.append(span);}else n.dataset.groupI18n=key;return n;};
  const button=(key,fn)=>{const n=btn(t(key),fn);n.dataset.groupI18n=key;return n;};
  const dialog=el('dialog','','groups-dialog'); dialog.id='groupsDialog';dialog.setAttribute('aria-labelledby','groupsTitle');
  const heading=el('div','','groups-heading'),title=text('h2','title');title.id='groupsTitle'; heading.append(title,button('close',()=>dialog.close()));
  const body=el('div','','groups-body'),status=el('p','','groups-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const login=el('div');login.append(text('p','loginNote','groups-note'),button('login',()=>{dialog.close();auth.openAccount();}));
  const setup=text('p','setup','groups-note groups-setup');setup.hidden=true;
  const account=el('div'),nickname=el('input'); nickname.maxLength=50;nickname.required=true;
  const nameLabel=text('label','nickname');nameLabel.append(nickname);account.append(nameLabel);
  function inputForm(titleKey,fieldKey,maxLength,handler){const details=el('details'),form=el('form'),input=el('input');input.maxLength=maxLength;input.required=true;const label=text('label',fieldKey);label.append(input);const submit=text('button',titleKey,'primary');submit.type='submit';form.append(label,submit);details.append(text('summary',titleKey),form);form.addEventListener('submit',e=>{e.preventDefault();run(submit,()=>handler(input.value.trim())).catch(fail);});account.append(details);return input;}
  inputForm('create','name',80,async name=>{requireAdult();const data=await rpc('travel_create_group',{group_name:name,member_name:nickname.value.trim()||auth.displayName||'Voyageur'});await loadGroups();await selectGroup(data.group_id);showInvite(data.token);});
  inputForm('join','code',32,async code=>{requireAdult();const token=core.invitation(code);if(!token)throw Error('Invitation invalide');const id=await rpc('travel_join_group',{invite_token:token,member_name:nickname.value.trim()||auth.displayName||'Voyageur'});await loadGroups();await selectGroup(id);});
  const toolbar=el('div','','groups-toolbar'),groupSelect=el('select');groupSelect.setAttribute('aria-label',t('title'));toolbar.append(groupSelect,button('refresh',async()=>{await loadGroups();if(current)await refresh();}));account.append(toolbar);
  const workspace=el('div'),tabs=el('div','','groups-tabs'),panes={},tabButtons={};
  for(const key of ['chat','map','gallery','trip']) {const pane=el('section','','groups-section');pane.hidden=key!=='chat';panes[key]=pane;const b=button(key,()=>{for(const k of Object.keys(panes)){panes[k].hidden=k!==key;tabButtons[k].setAttribute('aria-pressed',String(k===key));}if(key==='map')drawMap();});b.setAttribute('aria-pressed',String(key==='chat'));tabs.append(b);tabButtons[key]=b;}
  workspace.append(tabs,...Object.values(panes));account.append(workspace);
  const messages=el('div','','groups-messages');messages.setAttribute('aria-label',t('chat'));const messageForm=el('form'),messageInput=el('textarea');messageInput.maxLength=2000;messageInput.required=true;messageInput.rows=2;const messageLabel=text('label','message');messageLabel.append(messageInput);const send=text('button','send','primary');send.type='submit';messageForm.append(messageLabel,send);panes.chat.append(messages,messageForm);
  messageForm.addEventListener('submit',e=>{e.preventDefault();run(send,async()=>{requireAdult();const group=current;const result=await auth.client.from('travel_messages').insert({group_id:group,user_id:auth.userId,body:messageInput.value.trim()});check(result);messageInput.value='';await refresh();}).catch(fail);});
  const sharing=el('div','','groups-sharing'),consent=text('label','consent'),consentInput=el('input');consentInput.type='checkbox';consent.prepend(consentInput);
  const shareActions=el('div','','groups-actions'),start=button('start',()=>run(start,startSharing)),stop=button('stop',()=>stopSharing());stop.hidden=true;shareActions.append(start,stop);sharing.append(consent,shareActions);
  const shareStatus=el('p','','groups-note'),mapBox=el('div','','groups-map'),positionList=el('div');mapBox.id='groupsMap';panes.map.append(text('p','locationNote','groups-note'),sharing,shareStatus,mapBox,positionList);
  const gallery=el('div','','groups-gallery'),mediaActions=el('div','','groups-actions'),fileInput=el('input');fileInput.type='file';fileInput.accept=Object.keys(core.TYPES).join(',');fileInput.hidden=true;
  const photoInput=el('input'),videoInput=el('input');for(const [input,accept]of [[photoInput,'image/*'],[videoInput,'video/*']]){input.type='file';input.accept=accept;input.setAttribute('capture','environment');input.hidden=true;}
  mediaActions.append(button('choose',()=>fileInput.click()),button('photo',()=>photoInput.click()),button('video',()=>videoInput.click()));
  const preview=el('div','','groups-preview'),mediaForm=el('form'),caption=el('input');caption.maxLength=240;const captionLabel=text('label','caption');captionLabel.append(caption);const upload=text('button','upload','primary');upload.type='submit';mediaForm.hidden=true;mediaForm.append(captionLabel,upload);
  panes.gallery.append(text('p','mediaNote','groups-note'),mediaActions,fileInput,photoInput,videoInput,preview,mediaForm,gallery);
  let selectedFile=null,previewUrl='';
  function clearPreview(){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl='';selectedFile=null;preview.replaceChildren();mediaForm.hidden=true;}
  function showBlob(blob,mime){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(blob);const item=el(mime.startsWith('video/')?'video':'img');if(item.tagName==='VIDEO'){item.controls=true;item.preload='metadata';}else item.alt=caption.value||t('gallery');item.src=previewUrl;preview.replaceChildren(item);}
  for(const input of [fileInput,photoInput,videoInput]) input.addEventListener('change',()=>{const file=input.files?.[0];input.value='';if(!file)return;clearPreview();if(!core.validMedia(file)){notice(t('invalid'),true);return;}selectedFile=file;caption.value='';showBlob(file,file.type);mediaForm.hidden=false;});
  mediaForm.addEventListener('submit',e=>{e.preventDefault();run(upload,uploadMedia).catch(fail);});
  const planForm=el('form'),planFields={};for(const [key,type]of [['destination','text'],['date','date'],['description','textarea']]){const label=text('label',key),input=el(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.maxLength=key==='description'?2000:240;label.append(input);planForm.append(label);planFields[key]=input;}
  const save=text('button','save','primary');save.type='submit';planForm.append(save);planForm.addEventListener('submit',e=>{e.preventDefault();run(save,async()=>{requireAdult();check(await auth.client.from('travel_groups').update({destination:planFields.destination.value.trim(),travel_date:planFields.date.value||null,description:planFields.description.value.trim()}).eq('id',current));notice(t('saved'));await loadGroups();}).catch(fail);});
  const inviteButton=button('invite',async()=>{showInvite(await rpc('travel_invite',{g:current}));}),inviteCode=el('code','','groups-invite'),inviteNote=text('p','inviteNote','groups-note');inviteCode.hidden=true;inviteNote.hidden=true;
  const membersList=el('div'),leave=button('leave',async()=>{await stopSharing(false);await rpc('travel_remove_member',{g:current,member_id:auth.userId});await resetGroup();await loadGroups();});
  panes.trip.append(planForm,inviteButton,inviteCode,inviteNote,membersList,text('p','leaveNote','groups-note'),leave);
  body.append(login,setup,account,status);dialog.append(heading,body);document.body.append(dialog);
  let groups=[],current='',members=[],channel=null,poll=null,map=null,markers=null,refreshing=false,refreshAgain=false,epoch=0,openedUser='',mediaSignature='',messageSignature='';
  let watch=null,shareGroup='',shareUser='',shareUntil=0,shareEpoch=0,lastSent=0,publishQueue=Promise.resolve(),shareTimer=null;
  const nav=document.getElementById('groupsButton');
  function notice(message,error=false){status.textContent=message;status.classList.toggle('is-error',error);}
  function check(result){if(result.error)throw result.error;return result.data;}
  function fail(error){if(/PGRST20[25]|42P01|travel_.*(?:does not exist|schema cache)/i.test(`${error.code} ${error.message}`)){setup.hidden=false;notice(t('setup'),true);}else notice(t('error'),true);}
  function requireAdult(){if(!auth.signedIn||window.NavigueGuide?.isChild()||!current&&dialog.open===false)throw Error('Accès refusé');}
  async function rpc(name,args){requireAdult();return check(await auth.client.rpc(name,args));}
  async function run(button,action){button.disabled=true;try{return await action();}finally{button.disabled=false;}}
  function showInvite(token){for(const key of Object.keys(panes)){panes[key].hidden=key!=='trip';tabButtons[key].setAttribute('aria-pressed',String(key==='trip'));}inviteCode.textContent=token;inviteCode.hidden=false;inviteNote.hidden=false;}
  const memberName=id=>members.find(m=>m.user_id===id)?.nickname||t('oldMember');
  const time=value=>new Intl.DateTimeFormat(language(),{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
  async function loadGroups(){
    const user=auth.userId;const data=check(await auth.client.from('travel_groups').select('id,owner_id,name,destination,travel_date,description,created_at').order('created_at',{ascending:false}));
    if(user!==auth.userId)return;groups=data||[];groupSelect.replaceChildren();const empty=el('option',t('empty'));empty.value='';groupSelect.append(empty);for(const group of groups){const o=el('option',group.name);o.value=group.id;groupSelect.append(o);}groupSelect.value=current;
    if(current&&!groups.some(g=>g.id===current))await resetGroup();workspace.hidden=!current;
  }
  async function resetGroup(){
    epoch++; current=''; lastPositions=[]; mapFitted=''; workspace.hidden=true;
    const oldChannel=channel;channel=null;clearInterval(poll);poll=null;
    const stopping=stopSharing(false);
    members=[];messages.replaceChildren();gallery.replaceChildren();positionList.replaceChildren();markers?.clearLayers();clearPreview();
    inviteCode.textContent='';inviteCode.hidden=true;inviteNote.hidden=true;mediaSignature='';messageSignature='';messageInput.value='';consentInput.checked=false;
    await stopping;
    if(oldChannel&&auth.client)await auth.client.removeChannel(oldChannel);
  }
  async function selectGroup(id){const targetEpoch=epoch+1;await resetGroup();if(epoch!==targetEpoch||!id)return;requireAdult();current=id;groupSelect.value=id;workspace.hidden=false;const group=groups.find(g=>g.id===id);if(!group){await resetGroup();return;}const owner=group.owner_id===auth.userId;inviteButton.hidden=!owner;save.hidden=!owner;leave.hidden=owner;for(const key of Object.keys(planFields)){planFields[key].value=group[key==='date'?'travel_date':key]||'';planFields[key].readOnly=!owner;}
    await refresh();if(current!==id)return;
    channel=auth.client.channel(`travel:${id}:${crypto.randomUUID()}`);
    for(const table of ['travel_messages','travel_locations','travel_members','travel_media'])channel.on('postgres_changes',{event:'*',schema:'public',table,filter:`group_id=eq.${id}`},()=>refresh().catch(fail));
    channel.subscribe(state=>{if(['CHANNEL_ERROR','TIMED_OUT'].includes(state))notice(t('realtime'));});
    poll=setInterval(()=>{drawPositions(lastPositions);refresh().catch(fail);},10000);
  }
  groupSelect.addEventListener('change',()=>run(groupSelect,()=>selectGroup(groupSelect.value)).catch(fail));
  let lastPositions=[];
  async function refresh(){
    if(!current||!auth.signedIn)return;if(refreshing){refreshAgain=true;return;}refreshing=true;const group=current,id=epoch,user=auth.userId;
    try{
      const [membership,chat,locations,media,plan]=await Promise.all([
        auth.client.from('travel_members').select('user_id,nickname,joined_at').eq('group_id',group).order('joined_at'),
        auth.client.from('travel_messages').select('id,user_id,body,created_at').eq('group_id',group).order('created_at',{ascending:false}).limit(100),
        auth.client.from('travel_locations').select('user_id,lat,lon,accuracy,updated_at,expires_at').eq('group_id',group),
        auth.client.from('travel_media').select('id,user_id,path,mime_type,caption,created_at').eq('group_id',group).order('created_at',{ascending:false}).limit(30),
        auth.client.from('travel_groups').select('id,owner_id,name,destination,travel_date,description,created_at').eq('id',group).single()
      ]);const rows=check(membership)||[];if(id!==epoch||user!==auth.userId||current!==group)return;
      if(!rows.some(m=>m.user_id===user)){await resetGroup();await loadGroups();return;}
      const latest=check(plan);if(latest){groups=groups.map(g=>g.id===group?latest:g);if(latest.owner_id!==user)for(const key of Object.keys(planFields))planFields[key].value=latest[key==='date'?'travel_date':key]||'';}
      members=rows;renderMembers();renderMessages((check(chat)||[]).reverse());lastPositions=check(locations)||[];drawPositions(lastPositions);renderMedia(check(media)||[]);
    }finally{refreshing=false;if(refreshAgain){refreshAgain=false;queueMicrotask(()=>refresh().catch(fail));}}
  }
  function renderMessages(rows){const signature=JSON.stringify([rows,members.map(m=>m.nickname)]);if(signature===messageSignature)return;messageSignature=signature;const atEnd=messages.scrollTop+messages.clientHeight>=messages.scrollHeight-50;messages.replaceChildren();if(!rows.length)messages.append(el('p',t('noMessages'),'groups-note'));for(const row of rows){const article=el('article','','groups-message');article.append(el('strong',memberName(row.user_id)),el('p',row.body),el('small',time(row.created_at)));messages.append(article);}if(atEnd)messages.scrollTop=messages.scrollHeight;}
  function renderMembers(){membersList.replaceChildren();for(const member of members){const row=el('div','','groups-member');row.append(el('span',member.nickname));if(groups.find(g=>g.id===current)?.owner_id===auth.userId&&member.user_id!==auth.userId)row.append(button('remove',async()=>{await rpc('travel_remove_member',{g:current,member_id:member.user_id});await refresh();}));membersList.append(row);}}
  function drawMap(){if(!window.L)return;if(!map){map=window.L.map(mapBox).setView([48.8566,2.3522],4);window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors',maxZoom:19}).addTo(map);markers=window.L.layerGroup().addTo(map);}setTimeout(()=>{map.invalidateSize();drawPositions(lastPositions);},0);}
  let mapFitted='';
  function drawPositions(rows){positionList.replaceChildren();markers?.clearLayers();const points=rows.filter(p=>core.live(p));if(!points.length)positionList.append(el('p',t('nobody'),'groups-note'));for(const point of points){const description=`${memberName(point.user_id)} · ±${Math.round(point.accuracy)} m · ${time(point.updated_at)}`;positionList.append(el('p',description,'groups-note'));if(markers){const popup=el('span',description);window.L.circleMarker([point.lat,point.lon],{radius:8,color:'#397755',fillOpacity:.9}).bindPopup(popup).addTo(markers);window.L.circle([point.lat,point.lon],{radius:point.accuracy,color:'#397755',weight:1,fillOpacity:.07}).addTo(markers);}}
    if(map&&points.length&&mapFitted!==current){map.fitBounds(points.map(p=>[p.lat,p.lon]),{padding:[25,25],maxZoom:15});mapFitted=current;}}
  async function startSharing(){requireAdult();if(!current||!consentInput.checked||!navigator.geolocation){notice(t('consent'),true);return;}await stopSharing(false);shareGroup=current;shareUser=auth.userId;shareUntil=Date.now()+3600000;consentInput.checked=true;consentInput.disabled=true;notice('');const token=++shareEpoch;start.hidden=true;stop.hidden=false;shareStatus.textContent=t('sharing');lastSent=0;
    watch=navigator.geolocation.watchPosition(position=>{
      if(token!==shareEpoch||!shareGroup||Date.now()>shareUntil){if(token===shareEpoch)stopSharing().catch(fail);return;}
      if(Date.now()-lastSent<10000||Date.now()-position.timestamp>30000)return;lastSent=Date.now();const group=shareGroup;
      publishQueue=publishQueue.catch(()=>{}).then(async()=>{if(token!==shareEpoch)return;const r=await auth.client.rpc('travel_share_location',{g:group,latitude:position.coords.latitude,longitude:position.coords.longitude,precision_m:Math.min(position.coords.accuracy,100000)});check(r);if(current===group)refresh().catch(fail);}).catch(()=>{if(token===shareEpoch){shareStatus.textContent=t('error');}});
    },()=>{stopSharing(false).then(()=>shareStatus.textContent=t('permission')).catch(fail);},{enableHighAccuracy:true,maximumAge:5000,timeout:20000});
    shareTimer=setTimeout(()=>stopSharing().catch(fail),3600000);
  }
  async function stopSharing(announce=true){const group=shareGroup,user=shareUser;shareEpoch++;shareGroup='';shareUser='';if(watch!==null)navigator.geolocation.clearWatch(watch);watch=null;clearTimeout(shareTimer);start.hidden=false;stop.hidden=true;consentInput.checked=false;consentInput.disabled=false;if(announce){notice('');shareStatus.textContent=t('stopped');}lastPositions=lastPositions.filter(p=>p.user_id!==user);drawPositions(lastPositions);await publishQueue.catch(()=>{});if(group&&auth.client){const result=await auth.client.from('travel_locations').delete().eq('group_id',group).eq('user_id',user);if(result.error&&announce)notice(t('stopped'));}}
  window.NavigueGroups={stopSharing:()=>stopSharing(false)};
  async function uploadMedia(){requireAdult();if(!core.validMedia(selectedFile)||!current)throw Error('Invalid file');const group=current,user=auth.userId,file=selectedFile;notice(t('uploading'));groupSelect.disabled=true;let path='';
    try{const mime=file.type;path=`${group}/${user}/${crypto.randomUUID()}.${core.TYPES[mime]}`;check(await auth.client.storage.from('travel-gallery').upload(path,file,{contentType:mime,upsert:false}));
      try{check(await auth.client.from('travel_media').insert({group_id:group,user_id:user,path,mime_type:mime,caption:caption.value.trim()}));}catch(error){await auth.client.storage.from('travel-gallery').remove([path]);throw error;}
      if(current===group){clearPreview();caption.value='';notice(t('saved'));await refresh();}
    }finally{groupSelect.disabled=false;}
  }
  function renderMedia(rows){const signature=JSON.stringify(rows);if(signature===mediaSignature)return;mediaSignature=signature;gallery.replaceChildren();if(!rows.length)gallery.append(el('p',t('noMedia'),'groups-note'));for(const row of rows){const card=el('article','','groups-media');card.append(el('strong',memberName(row.user_id)),el('p',row.caption||row.mime_type),el('p',time(row.created_at),'groups-note'));
      card.append(button('open',async()=>{requireAdult();const group=current,id=epoch;const blob=check(await auth.client.storage.from('travel-gallery').download(row.path));if(group===current&&id===epoch){clearPreview();showBlob(blob,row.mime_type);preview.scrollIntoView({behavior:'smooth',block:'center'});}}));
      if(row.user_id===auth.userId)card.append(button('delete',async()=>{check(await auth.client.storage.from('travel-gallery').remove([row.path]));check(await auth.client.from('travel_media').delete().eq('id',row.id));clearPreview();notice(t('deleted'));await refresh();}));gallery.append(card);}}
  async function open(){if(dialog.open)return;if(window.NavigueGuide?.isChild()){notice(t('child'),true);return;}dialog.showModal();login.hidden=auth.signedIn;account.hidden=!auth.signedIn;setup.hidden=true;notice('');if(auth.signedIn){nickname.value=auth.displayName||'';openedUser=auth.userId;await loadGroups();if(groups.length)await selectGroup(groups[0].id);}}
  nav?.addEventListener('click',()=>open().catch(fail));dialog.addEventListener('close',()=>{resetGroup().catch(fail);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSharing().catch(fail);});
  window.addEventListener('pagehide',()=>{shareStatus.textContent=t('stopped');stopSharing(false).catch(()=>{});});
  document.addEventListener('navigue:child-mode',()=>{if(window.NavigueGuide?.isChild()){dialog.close();resetGroup().catch(fail);}if(nav)nav.hidden=window.NavigueGuide?.isChild();});
  document.addEventListener('navigue:auth',()=>{if(openedUser!==auth.userId){openedUser=auth.userId;resetGroup().catch(fail);if(dialog.open){login.hidden=auth.signedIn;account.hidden=!auth.signedIn;if(auth.signedIn)loadGroups().catch(fail);}}});
  document.addEventListener('navigue:language',()=>{groupSelect.setAttribute('aria-label',t('title'));messages.setAttribute('aria-label',t('chat'));dialog.querySelectorAll('[data-group-i18n]').forEach(node=>node.textContent=t(node.dataset.groupI18n));if(nav)nav.textContent=t('title');messageSignature='';mediaSignature='';if(current)refresh().catch(fail);});
  if(nav)nav.textContent=t('title');workspace.hidden=true;account.hidden=true;
})();
