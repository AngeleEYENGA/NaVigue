(() => {
  'use strict';
  const places = window.NavigueAddressPlaces = new Map();
  const cache = new Map();
  const copy = {
    fr: ['Recherche d’adresses…', 'Aucune adresse trouvée. Ajoutez la ville.', 'Suggestions indisponibles. Vous pouvez saisir l’adresse.', 'adresses proposées'],
    en: ['Searching addresses…', 'No address found. Add the city.', 'Suggestions unavailable. You can type the address.', 'address suggestions'],
    es: ['Buscando direcciones…', 'No hay resultados. Añade la ciudad.', 'Sugerencias no disponibles. Escribe la dirección.', 'direcciones sugeridas'],
    de: ['Adressen werden gesucht…', 'Keine Adresse gefunden. Stadt hinzufügen.', 'Vorschläge nicht verfügbar. Adresse eingeben.', 'Adressvorschläge'],
    zh: ['正在搜索地址…', '未找到地址，请添加城市。', '地址建议暂不可用，请手动输入地址。', '个地址建议']
  };
  function attach(input) {
    const host = document.createElement('div'); host.className = 'address-autocomplete';
    input.parentNode.insertBefore(host, input); host.append(input);
    const list = document.createElement('div'); list.id = `${input.id}-suggestions`; list.className = 'address-options'; list.setAttribute('role', 'listbox'); list.hidden = true;
    const status = document.createElement('span'); status.className = 'address-status'; status.setAttribute('role', 'status');
    host.append(list, status);
    input.autocomplete = 'off'; input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-controls', list.id); input.setAttribute('aria-expanded', 'false');
    let timer, request, version = 0, items = [], active = -1;
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
    const cancel = () => { version++; clearTimeout(timer); request?.abort(); };
    function select(index) {
      const place = items[index]; if (!place) return;
      cancel(); input.value = place.name;
      places.set(place.name.trim().toLocaleLowerCase(), place);
      if (places.size > 100) places.delete(places.keys().next().value);
      close(); status.textContent = '';
      input.dispatchEvent(new Event('input', {bubbles: true})); input.dispatchEvent(new Event('change', {bubbles: true}));
      cancel(); close(); input.focus();
    }
    function render() {
      list.replaceChildren(); active = -1;
      items.forEach((place, index) => {
        const option = document.createElement('div'); option.id = `${list.id}-${index}`; option.setAttribute('role', 'option'); option.setAttribute('aria-selected', 'false'); option.textContent = place.name;
        option.addEventListener('pointerdown', event => event.preventDefault()); option.addEventListener('click', () => select(index)); list.append(option);
      });
      list.hidden = !items.length; input.setAttribute('aria-expanded', String(!!items.length));
    }
    input.addEventListener('input', () => {
      cancel(); close(); status.textContent = ''; items = [];
      const query = input.value.trim(); if (query.length < 3) return;
      const lang = (localStorage.getItem('navigueLanguage') || 'fr').slice(0, 2), words = copy[lang] || copy.fr, key = `${lang}:${query.toLocaleLowerCase()}`, id = version;
      timer = setTimeout(async () => {
        status.textContent = words[0]; const local = new AbortController(); request = local; const timeout = setTimeout(() => local.abort(), 8000);
        try {
          let results = cache.get(key);
          if (!results) {
            const params = new URLSearchParams({q: query, limit: '5'});
            if (['fr', 'en', 'de'].includes(lang)) params.set('lang', lang);
            const response = await fetch(`https://photon.komoot.io/api/?${params}`, {signal: local.signal}); if (!response.ok) throw new Error('search');
            const data = await response.json(); const seen = new Set();
            results = (data.features || []).flatMap(feature => {
              const [lon, lat] = feature.geometry?.coordinates || []; const p = feature.properties || {};
              const name = [...new Set([p.name, [p.housenumber, p.street].filter(Boolean).join(' '), [p.postcode, p.city || p.town || p.village].filter(Boolean).join(' '), p.state, p.country].filter(Boolean))].join(', ');
              if (!name || !Number.isFinite(lat) || !Number.isFinite(lon) || seen.has(name)) return []; seen.add(name); return [{name, lat, lon}];
            });
            cache.set(key, results); if (cache.size > 60) cache.delete(cache.keys().next().value);
          }
          if (id !== version || document.activeElement !== input) return;
          items = results; render(); status.textContent = items.length ? `${items.length} ${words[3]}` : words[1];
        } catch (error) { if (id === version && document.activeElement === input) status.textContent = words[2]; }
        finally { clearTimeout(timeout); }
      }, 350);
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') { cancel(); close(); status.textContent = ''; return; }
      if (list.hidden) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); active = (active + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        [...list.children].forEach((option, index) => option.setAttribute('aria-selected', String(index === active)));
        input.setAttribute('aria-activedescendant', list.children[active].id); list.children[active].scrollIntoView({block: 'nearest'});
      } else if (event.key === 'Enter' && active >= 0) { event.preventDefault(); select(active); }
    });
    input.addEventListener('blur', () => { cancel(); close(); status.textContent = ''; });
  }
  ['origin', 'destination', 'outing-from', 'outing-to'].forEach(id => { const input = document.getElementById(id); if (input) attach(input); });
})();
