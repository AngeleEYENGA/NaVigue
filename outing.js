(() => {
  'use strict';
  const core = window.NavigueOutingCore;
  const bridge = window.NavigueGuide;
  const mount = document.getElementById('outingMount');
  if (!core || !bridge || !mount) return;
  const COPY = {
    'fr-FR': {
      title: 'Organiser ma sortie', subtitle: 'À pied, selon votre temps, vos envies et votre budget.',
      from: 'D’où partez-vous ?', to: 'Où voulez-vous arriver ?', address: 'Un lieu et sa ville',
      time: 'Temps disponible, trajet et pause compris', budget: 'Budget souhaité pour la pause (€)', detour: 'Détour maximum', visit: 'Temps prévu pour une pause',
      interests: 'Qu’aimeriez-vous trouver sur votre chemin ?', parks: 'Parcs et jardins', culture: 'Culture et monuments', food: 'Manger ou boire', activities: 'Loisirs', pharmacy: 'Pharmacies', health: 'Hôpitaux et centres de santé',
      prepare: 'Proposer ma sortie', cancel: 'Annuler', working: 'Je cherche le trajet et des pauses sur votre chemin…',
      note: 'Les pauses sont des alternatives : choisissez-en une, leurs durées ne se cumulent pas. Les prix, menus et horaires ne sont pas encore vérifiés. Le budget est un souhait, pas une garantie de prix.',
      free: 'Budget de 0 € : priorité aux parcs et monuments extérieurs ; vérifiez leur gratuité avant de partir.',
      source: 'Source : OpenStreetMap via Photon. Données consultées aujourd’hui ; horaires et tarifs à vérifier auprès du lieu.',
      unknown: 'Prix et horaires non vérifiés', map: 'Voir le lieu sur OpenStreetMap', route: 'Afficher le trajet direct',
      no: 'Aucune pause vérifiée ne respecte ces critères dans les lieux examinés. Élargissez le détour ou le temps disponible.',
      unavailable: 'Un service cartographique est indisponible. Réessayez dans un instant.', partial: 'Certains lieux n’ont pas pu être vérifiés. Les résultats sont partiels.',
      tooLong: 'Le trajet à pied dépasse le temps disponible. Augmentez la durée ou choisissez une arrivée plus proche.',
      longRoute: 'Pour cette première version, choisissez un trajet à pied de moins de 20 km.',
      choose: 'Choisissez au moins un centre d’intérêt.', child: 'Un adulte doit quitter le mode enfant pour organiser une sortie libre.',
      found: 'Pauses possibles, dans l’ordre du trajet', base: 'Trajet direct à pied', extra: 'de détour à pied', total: 'trajet + pause', pause: 'pause prévue',
      budgetLabel: 'Budget souhaité', budgetUnknown: 'Aucun prix vérifié : budget à confirmer sur place.', coverage: 'Recherche autour de quatre points du trajet, à 600 m maximum du tracé. Les résultats ne sont pas exhaustifs.',
      stopped: 'Recherche annulée.', stale: 'Vos critères ont changé. Relancez la recherche pour les appliquer.', shown: 'Trajet direct affiché ci-dessous. Les pauses proposées ne sont pas ajoutées automatiquement.'
    },
    'en-US': {
      title: 'Plan my outing', subtitle: 'A walking trip based on your time, interests and budget.', from: 'Where are you starting?', to: 'Where do you want to arrive?', address: 'A place and its city', time: 'Available time, including walking and a break', budget: 'Desired budget for the break (€)', detour: 'Maximum detour', visit: 'Time for one break', interests: 'What would you like to find along the way?', parks: 'Parks and gardens', culture: 'Culture and monuments', food: 'Food and drink', activities: 'Leisure', pharmacy: 'Pharmacies', health: 'Hospitals and health centres', prepare: 'Suggest my outing', cancel: 'Cancel', working: 'Finding your route and possible stops…',
      note: 'Stops are alternatives: choose one; their durations are not combined. Prices, menus and opening hours are not yet verified. Your budget is a preference, not a price guarantee.', free: '€0 budget: prioritising parks and outdoor monuments; check that admission is free.', source: 'Source: OpenStreetMap via Photon. Retrieved today; check hours and prices with the venue.', unknown: 'Prices and hours unverified', map: 'View place on OpenStreetMap', route: 'Show the direct route', no: 'No verified stop meets your criteria among the places checked. Allow more time or a longer detour.', unavailable: 'A map service is unavailable. Please try again shortly.', partial: 'Some places could not be checked. Results are partial.', tooLong: 'The walk exceeds your available time. Allow more time or choose a closer destination.', longRoute: 'For this first version, choose a walk shorter than 20 km.', choose: 'Choose at least one interest.', child: 'An adult must leave child mode to plan an unrestricted outing.', found: 'Possible stops, in route order', base: 'Direct walking route', extra: 'extra walking', total: 'walk + break', pause: 'planned break', budgetLabel: 'Desired budget', budgetUnknown: 'No verified prices: confirm your budget with the venue.', coverage: 'Searching around four route points, within 600 m of the route. Results are not exhaustive.', stopped: 'Search cancelled.', stale: 'Your preferences changed. Search again to apply them.', shown: 'Direct route shown below. Suggested stops are not added automatically.'
    },
    'es-ES': {
      title: 'Organizar mi salida', subtitle: 'Un paseo según tu tiempo, tus gustos y tu presupuesto.', from: '¿De dónde sales?', to: '¿Adónde quieres llegar?', address: 'Un lugar y su ciudad', time: 'Tiempo disponible, paseo y pausa incluidos', budget: 'Presupuesto deseado para la pausa (€)', detour: 'Desvío máximo', visit: 'Tiempo para una pausa', interests: '¿Qué quieres encontrar por el camino?', parks: 'Parques y jardines', culture: 'Cultura y monumentos', food: 'Comer o beber', activities: 'Ocio', pharmacy: 'Farmacias', health: 'Hospitales y centros de salud', prepare: 'Proponer mi salida', cancel: 'Cancelar', working: 'Buscando la ruta y posibles paradas…',
      note: 'Las paradas son alternativas: elige una; sus tiempos no se suman. Los precios, menús y horarios aún no están verificados. El presupuesto es una preferencia, no una garantía.', free: 'Presupuesto de 0 €: prioridad a parques y monumentos al aire libre; comprueba que sean gratuitos.', source: 'Fuente: OpenStreetMap mediante Photon. Consultado hoy; confirma horarios y precios con el establecimiento.', unknown: 'Precios y horarios sin verificar', map: 'Ver lugar en OpenStreetMap', route: 'Mostrar la ruta directa', no: 'Ninguna parada verificada cumple los criterios entre los lugares consultados. Amplía el tiempo o el desvío.', unavailable: 'Un servicio de mapas no está disponible. Inténtalo de nuevo.', partial: 'No se pudieron comprobar algunos lugares. Resultados parciales.', tooLong: 'El paseo supera el tiempo disponible. Amplía la duración o elige un destino más cercano.', longRoute: 'En esta primera versión, elige un paseo de menos de 20 km.', choose: 'Elige al menos un interés.', child: 'Un adulto debe salir del modo infantil para organizar una salida libre.', found: 'Posibles paradas, en orden del recorrido', base: 'Ruta directa a pie', extra: 'de desvío a pie', total: 'paseo + pausa', pause: 'pausa prevista', budgetLabel: 'Presupuesto deseado', budgetUnknown: 'Sin precios verificados: confirma el presupuesto en el lugar.', coverage: 'Búsqueda alrededor de cuatro puntos, hasta 600 m del recorrido. Los resultados no son exhaustivos.', stopped: 'Búsqueda cancelada.', stale: 'Los criterios han cambiado. Busca de nuevo para aplicarlos.', shown: 'Ruta directa mostrada abajo. Las paradas no se añaden automáticamente.'
    },
    'de-DE': {
      title: 'Meinen Ausflug planen', subtitle: 'Zu Fuß, passend zu Zeit, Interessen und Budget.', from: 'Wo startest du?', to: 'Wo möchtest du ankommen?', address: 'Ort und Stadt', time: 'Verfügbare Zeit inklusive Weg und Pause', budget: 'Gewünschtes Budget für die Pause (€)', detour: 'Maximaler Umweg', visit: 'Zeit für eine Pause', interests: 'Was möchtest du unterwegs finden?', parks: 'Parks und Gärten', culture: 'Kultur und Denkmäler', food: 'Essen und Trinken', activities: 'Freizeit', pharmacy: 'Apotheken', health: 'Krankenhäuser und Gesundheitszentren', prepare: 'Ausflug vorschlagen', cancel: 'Abbrechen', working: 'Route und mögliche Pausen werden gesucht…',
      note: 'Pausen sind Alternativen: Wähle eine; die Zeiten werden nicht addiert. Preise, Speisekarten und Öffnungszeiten sind noch nicht überprüft. Das Budget ist ein Wunsch, keine Preisgarantie.', free: '0-€-Budget: Parks und Denkmäler im Freien werden bevorzugt; freien Eintritt bitte prüfen.', source: 'Quelle: OpenStreetMap über Photon. Heute abgerufen; Zeiten und Preise beim Anbieter prüfen.', unknown: 'Preise und Zeiten ungeprüft', map: 'Ort auf OpenStreetMap ansehen', route: 'Direkten Weg anzeigen', no: 'Keine überprüfte Pause erfüllt die Kriterien unter den geprüften Orten. Erlaube mehr Zeit oder einen größeren Umweg.', unavailable: 'Ein Kartendienst ist nicht verfügbar. Bitte später erneut versuchen.', partial: 'Einige Orte konnten nicht überprüft werden. Ergebnisse sind unvollständig.', tooLong: 'Der Fußweg dauert länger als die verfügbare Zeit. Wähle mehr Zeit oder ein näheres Ziel.', longRoute: 'Wähle für diese erste Version einen Fußweg unter 20 km.', choose: 'Wähle mindestens ein Interesse.', child: 'Eine erwachsene Person muss den Kindermodus verlassen, um frei zu planen.', found: 'Mögliche Pausen in Wegreihenfolge', base: 'Direkter Fußweg', extra: 'zusätzlicher Fußweg', total: 'Weg + Pause', pause: 'geplante Pause', budgetLabel: 'Gewünschtes Budget', budgetUnknown: 'Keine geprüften Preise: Budget vor Ort bestätigen.', coverage: 'Suche um vier Wegpunkte, höchstens 600 m vom Weg entfernt. Ergebnisse sind nicht vollständig.', stopped: 'Suche abgebrochen.', stale: 'Deine Kriterien haben sich geändert. Suche erneut.', shown: 'Direkter Weg unten angezeigt. Pausen werden nicht automatisch hinzugefügt.'
    },
    'zh-CN': {
      title: '规划我的出游', subtitle: '根据时间、兴趣和预算，规划步行出游。', from: '从哪里出发？', to: '想到哪里结束？', address: '地点及所在城市', time: '可用时间（含步行和一次停留）', budget: '停留预算（欧元）', detour: '最多绕行时间', visit: '一次停留的时间', interests: '沿途想找什么？', parks: '公园和花园', culture: '文化和纪念建筑', food: '餐饮', activities: '休闲活动', pharmacy: '药店', health: '医院和健康中心', prepare: '推荐出游计划', cancel: '取消', working: '正在搜索路线和沿途停留点……',
      note: '停留点是备选方案，请选择其中一个，时间不累计。价格、菜单和营业时间尚未核实。预算仅为偏好，并非价格保证。', free: '预算为0欧元：优先公园和户外纪念建筑，请确认是否免费。', source: '来源：通过Photon获取OpenStreetMap数据。今日查询；请向场所核实营业时间和价格。', unknown: '价格和营业时间未经核实', map: '在OpenStreetMap查看地点', route: '显示直达步行路线', no: '已查询地点中没有符合条件的停留点。请增加时间或允许更多绕行。', unavailable: '地图服务暂时不可用，请稍后重试。', partial: '部分地点无法核实，结果可能不完整。', tooLong: '步行时间超过可用时间。请增加时间或选择更近的终点。', longRoute: '当前版本请选择20公里以内的步行路线。', choose: '请至少选择一项兴趣。', child: '请让成年人退出儿童模式后规划自由出游。', found: '按沿途顺序排列的备选停留点', base: '直达步行路线', extra: '额外步行', total: '步行和停留', pause: '计划停留', budgetLabel: '期望预算', budgetUnknown: '暂无核实价格，请向场所确认预算。', coverage: '搜索沿途四个点附近、距离路线600米以内的地点。结果并非完整列表。', stopped: '已取消搜索。', stale: '条件已更改，请重新搜索。', shown: '直达路线已在下方显示，备选停留点不会自动添加。'
    }
  };
  const categories = {
    parks: ['leisure:park', 'leisure:garden'], culture: ['tourism:museum', 'tourism:gallery', 'historic:monument', 'historic:memorial'],
    food: ['amenity:restaurant', 'amenity:cafe'], activities: ['leisure:bowling_alley', 'amenity:cinema', 'tourism:attraction'],
    pharmacy: ['amenity:pharmacy'], health: ['amenity:hospital', 'amenity:clinic', 'healthcare:centre', 'healthcare:clinic']
  };
  const words = () => COPY[bridge.language()] || COPY['fr-FR'];
  const node = (tag, text, cls) => { const el = document.createElement(tag); if (text) el.textContent = text; if (cls) el.className = cls; return el; };
  const panel = node('details', '', 'outing');
  const summary = node('summary');
  const intro = node('span', '', 'outing-intro');
  intro.append(node('strong'), node('small')); summary.append(intro); panel.append(summary);
  const body = node('div', '', 'outing-body'), form = node('form'), grid = node('div', '', 'outing-grid');
  const labels = {}, inputs = {};
  function field(key, type, options) {
    const label = node('label'), caption = node('span'); labels[key] = caption;
    const input = node(type === 'select' ? 'select' : 'input'); input.id = `outing-${key}`; input.name = key;
    if (type !== 'select') input.type = type;
    if (options) options.forEach(value => { const option = node('option', `${value} min`); option.value = value; input.append(option); });
    if (type === 'text') { input.required = true; input.maxLength = 180; }
    label.append(caption, input); grid.append(label); inputs[key] = input;
  }
  field('from', 'text'); field('to', 'text'); field('time', 'select', [60, 120, 240, 480]); field('budget', 'number'); field('detour', 'select', [5, 10, 20]); field('visit', 'select', [10, 20, 45]);
  inputs.time.value = '120'; inputs.budget.value = '20'; inputs.budget.min = '0'; inputs.budget.max = '10000'; inputs.budget.step = '1'; inputs.budget.required = true; inputs.detour.value = '10'; inputs.visit.value = '20';
  const interests = node('fieldset'), legend = node('legend'), choices = node('div', '', 'outing-choices'); interests.append(legend, choices);
  const interestLabels = {};
  Object.keys(categories).forEach(key => { const label = node('label'), checkbox = node('input'), text = node('span'); checkbox.type = 'checkbox'; checkbox.name = 'interest'; checkbox.value = key; checkbox.checked = ['parks', 'culture'].includes(key); label.append(checkbox, text); choices.append(label); interestLabels[key] = text; });
  const note = node('p', '', 'outing-note'), actions = node('div', '', 'outing-actions');
  const submit = node('button', '', 'primary'), cancel = node('button', '', 'secondary-button'); submit.type = 'submit'; cancel.type = 'button'; cancel.hidden = true; actions.append(submit, cancel);
  const status = node('p', '', 'outing-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const heading = node('h3', '', 'outing-results-heading'); heading.hidden = true;
  const results = node('div', '', 'outing-results');
  const routeButton = node('button', '', 'secondary-button'); routeButton.type = 'button'; routeButton.hidden = true;
  form.append(grid, interests, note, actions); body.append(form, status, routeButton, heading, results); panel.append(body); mount.append(panel);
  let controller, generation = 0, savedPlan = null;
  function message(text, error = false) { status.textContent = text; status.classList.toggle('is-error', error); }
  function renderLanguage() {
    const w = words(); intro.children[0].textContent = w.title; intro.children[1].textContent = w.subtitle;
    Object.keys(labels).forEach(key => labels[key].textContent = w[key]); Object.keys(interestLabels).forEach(key => interestLabels[key].textContent = w[key]);
    inputs.from.placeholder = w.address; inputs.to.placeholder = w.address; legend.textContent = w.interests; note.textContent = w.note; submit.textContent = w.prepare; cancel.textContent = w.cancel; routeButton.textContent = w.route;
    if (savedPlan) renderPlan(savedPlan); else if (controller) message(w.working);
  }
  panel.addEventListener('toggle', () => {
    if (!panel.open) return;
    if (!inputs.from.value) { const from = document.getElementById('origin').value; if (!/^(?:ma position|my location|mi ubicaci|mein standort|我的位置)/iu.test(from)) inputs.from.value = from; }
    if (!inputs.to.value) inputs.to.value = document.getElementById('destination').value;
    if (bridge.isChild()) message(words().child, true);
  });
  async function get(url, signal) {
    const local = new AbortController(); const abort = () => local.abort(); signal.addEventListener('abort', abort, {once: true});
    const timeout = setTimeout(abort, 12000);
    try { if (signal.aborted) throw new DOMException('Aborted', 'AbortError'); const response = await fetch(url, {signal: local.signal}); if (!response.ok) throw new Error('service'); return await response.json(); }
    finally { clearTimeout(timeout); signal.removeEventListener('abort', abort); }
  }
  const routeUrl = points => `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${points.map(p => `${p.lon},${p.lat}`).join(';')}?overview=full&geometries=geojson&steps=true`;
  async function route(points, signal) { const data = await get(routeUrl(points), signal); const result = data.routes?.[0]; if (data.code !== 'Ok' || !result?.geometry?.coordinates?.length || !Number.isFinite(result.duration)) throw new Error('route'); return result; }
  async function geocode(text, signal) {
    const chosen = window.NavigueAddressPlaces?.get(text.trim().toLocaleLowerCase());
    if (chosen) return chosen;
    const params = new URLSearchParams({q: text, limit: '1', lang: bridge.language().slice(0,2)});
    const data = await get(`https://photon.komoot.io/api/?${params}`, signal), feature = data.features?.[0];
    if (!feature) throw new Error('address');
    const [lon, lat] = feature.geometry.coordinates; if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('address'); return {lat, lon};
  }
  function invalidate() {
    generation++; controller?.abort(); controller = null; submit.disabled = false; cancel.hidden = true; savedPlan = null;
    routeButton.hidden = true; heading.hidden = true; results.replaceChildren();
  }
  cancel.addEventListener('click', () => { invalidate(); message(words().stopped); });
  form.addEventListener('change', () => { invalidate(); message(words().stale); });
  form.addEventListener('submit', async event => {
    event.preventDefault(); invalidate(); const id = generation, w = words();
    if (bridge.isChild()) { message(w.child, true); return; }
    const selected = [...choices.querySelectorAll('input:checked')].map(input => input.value);
    if (!selected.length) { message(w.choose, true); return; }
    const preferences = {time: Number(inputs.time.value), budget: Number(inputs.budget.value), detour: Number(inputs.detour.value), visit: Number(inputs.visit.value)};
    controller = new AbortController(); const signal = controller.signal; submit.disabled = true; cancel.hidden = false; message(w.working);
    try {
      const fromText = inputs.from.value.trim(), toText = inputs.to.value.trim();
      const origin = await geocode(fromText, signal), destination = await geocode(toText, signal);
      const direct = await route([origin, destination], signal);
      if (direct.duration / 60 > preferences.time) { message(words().tooLong, true); return; }
      if (direct.distance > 20000) { message(words().longRoute, true); return; }
      let tags = selected.flatMap(key => categories[key]);
      if (preferences.budget === 0) tags = tags.filter(tag => ['leisure:park', 'leisure:garden', 'historic:monument', 'historic:memorial', ...categories.pharmacy, ...categories.health].includes(tag));
      const candidates = new Map(); let failures = 0;
      if (tags.length) for (const point of core.sampleRoute(direct.geometry.coordinates)) {
        const params = new URLSearchParams({lat: point.lat, lon: point.lon, radius: '0.8', limit: '40', lang: bridge.language().slice(0,2)}); tags.forEach(tag => params.append('osm_tag', tag));
        try {
          const data = await get(`https://photon.komoot.io/reverse?${params}`, signal);
          for (const feature of data.features || []) {
            const p = feature.properties || {}, [lon, lat] = feature.geometry?.coordinates || [], tag = `${p.osm_key}:${p.osm_value}`;
            if (!tags.includes(tag) || !p.name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
            const near = core.routeProximity({lat,lon}, direct.geometry.coordinates); if (near.distance > 600) continue;
            const key = p.osm_id ? `${p.osm_type}:${p.osm_id}` : `${p.name}:${lat}:${lon}`;
            const category = selected.find(key => categories[key].includes(tag));
            candidates.set(key, {key, name: p.name, lat, lon, category, progress: near.progress, distance: near.distance, address: [p.street,p.housenumber,p.city || p.town].filter(Boolean).join(', ')});
          }
        } catch (error) { if (signal.aborted) throw error; failures++; }
      }
      // Mix interests before checking a bounded number of actual waypoint routes.
      const sorted = [...candidates.values()].sort((a,b) => a.distance - b.distance), shortlist = [];
      for (let round = 0; round < 3; round++) for (const key of selected) { const candidate = sorted.filter(p => p.category === key)[round]; if (candidate && shortlist.length < 8) shortlist.push(candidate); }
      const stops = [];
      for (const place of shortlist) {
        if (stops.length >= 4) break;
        try {
          const via = await route([origin, place, destination], signal);
          if (core.fitsTime(direct.duration, via.duration, preferences.visit, preferences.time, preferences.detour)) stops.push({...place, detour: Math.max(0, Math.ceil((via.duration-direct.duration)/60)), total: Math.ceil(via.duration/60 + preferences.visit)});
        } catch (error) { if (signal.aborted) throw error; failures++; }
      }
      if (id !== generation || bridge.isChild()) return;
      savedPlan = {origin, destination, fromText, toText, direct, preferences, stops: stops.sort((a,b) => a.progress-b.progress), failures, date: new Date()}; renderPlan(savedPlan);
    } catch (error) { if (id === generation) message(words().unavailable, true); }
    finally { if (id === generation) { controller = null; submit.disabled = false; cancel.hidden = true; } }
  });
  function renderPlan(plan) {
    const w = words(), {preferences: p} = plan;
    message(`${w.base} : ${Math.ceil(plan.direct.duration/60)} min · ${(plan.direct.distance/1000).toFixed(1)} km. ${w.budgetLabel} : ${p.budget} €. ${p.budget === 0 ? w.free : w.budgetUnknown} ${w.coverage}${plan.failures ? ` ${w.partial}` : ''}${!plan.stops.length ? ` ${w.no}` : ''}`);
    routeButton.hidden = false; heading.textContent = w.found; heading.hidden = !plan.stops.length; results.replaceChildren();
    plan.stops.forEach((place, index) => {
      const article = node('article', '', 'outing-place');
      article.append(node('span', w[place.category], 'outing-category'), node('h3', `${index+1}. ${place.name}`));
      article.append(node('p', `+${place.detour} min ${w.extra} · ${place.total} min ${w.total} (${p.visit} min ${w.pause})`));
      if (place.address) article.append(node('p', place.address));
      article.append(node('p', w.unknown), node('p', w.source));
      const link = node('a', w.map); link.href = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=18/${place.lat}/${place.lon}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; article.append(link); results.append(article);
    });
  }
  routeButton.addEventListener('click', () => {
    if (!savedPlan || bridge.isChild()) { message(words().child, true); return; }
    try { bridge.showDirectRoute(savedPlan); message(`${status.textContent} ${words().shown}`); }
    catch (error) { message(words().unavailable, true); }
  });
  document.addEventListener('navigue:language', renderLanguage);
  document.addEventListener('navigue:child-mode', () => { invalidate(); panel.hidden = bridge.isChild(); if (!panel.hidden) message(''); });
  renderLanguage(); panel.hidden = bridge.isChild();
})();
