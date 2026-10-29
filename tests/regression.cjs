const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('function handleConversationInput'));
new vm.Script(script);
const destination = { value: '' };
let submitted = 0;
const context = vm.createContext({
  language: 'fr-FR', pendingConversationDestination: '', conversationAwaitingDestination: false,
  stopConversationAfterReply: false, kidMode: false,
  uiLanguage: () => context.language,
  currentVoiceInstruction: () => 'Instruction courante',
  handleVoiceNavigation: () => null,
  document: { getElementById: id => id === 'destination' ? destination : { requestSubmit: () => submitted++ } },
  window: { setTimeout: fn => fn(), NavigueFamilyAuth: { childFavorites: [{ label: 'Papa', address: '12 rue Exemple' }] } }
});
vm.runInContext(script.slice(script.indexOf('    const CONVERSATION_COPY'), script.indexOf('    function startConversation()')), context);
const say = text => vm.runInContext(`handleConversationInput(${JSON.stringify(text)})`, context);
for (const phrase of ['Bonjour', ' Bonjour ! ', 'Bonjour NaVigue.', 'NaVigue, bonjour !', 'Salut', 'Comment ça va ?', 'Bonjour, comment ça va ?', 'Merci', 'Quel temps fait-il ?', 'Je suis fatigué', 'Répète']) {
  const before = submitted;
  say(phrase);
  assert.equal(submitted, before, phrase + ' must not submit');
  assert.equal(destination.value, '', phrase + ' must not edit destination');
}
for (const [language, greeting, command, place] of [
  ['fr-FR', 'Bonjour NaVigue !', 'Bonjour, je veux aller au Louvre', 'Louvre'],
  ['en-US', 'Hello NaVigue!', 'Take me to London', 'London'],
  ['es-ES', '¡Hola!', 'Quiero ir al Prado', 'Prado'],
  ['de-DE', 'Guten Tag!', 'Ich möchte zum Louvre', 'Louvre'],
  ['zh-CN', '你好！', '带我去卢浮宫', '卢浮宫']
]) {
  context.language = language;
  const before = submitted;
  say(greeting);
  assert.equal(submitted, before);
  say(command);
  assert.equal(submitted, before + 1, command);
  assert.equal(destination.value, place, command);
}
context.language = 'fr-FR';
let before = submitted;
say('Tour Eiffel');
say('Bonjour');
assert.equal(submitted, before, 'a bare place and greeting require confirmation');
say('Non'); say('Oui');
assert.equal(submitted, before, 'cancel clears pending place');
say('Tour Eiffel'); say('Oui');
assert.equal(submitted, before + 1);
assert.equal(destination.value, 'Tour Eiffel');
before = submitted;
context.kidMode = true;
say('Je veux aller au Louvre');
assert.equal(submitted, before, 'child cannot route to an unapproved destination');
say('Je veux aller chez Papa');
assert.equal(submitted, before + 1);
assert.equal(destination.value, '12 rue Exemple');

// Every interface language must include the same keys and both selectors must expose all five.
const copy = vm.createContext({});
vm.runInContext(script.slice(script.indexOf('    const UI_COPY'), script.indexOf('    const uiLanguage')), copy);
const languages = ['fr-FR', 'en-US', 'es-ES', 'de-DE', 'zh-CN'];
for (const lang of languages) {
  assert.equal(vm.runInContext(`Object.keys(UI_COPY['fr-FR']).every(k => typeof UI_COPY[${JSON.stringify(lang)}][k] === 'string')`, copy), true, lang);
  for (const selector of ['quickLanguage', 'languageSetting']) {
    const options = html.match(new RegExp(`<select id="${selector}"[^>]*>([\\s\\S]*?)<\\/select>`))[1];
    assert.ok(options.includes(`value="${lang}"`), `${selector}: ${lang}`);
  }
}
console.log('PASS: script syntax, conversational routing in five languages, confirmation/cancellation, child restrictions, language coverage');

async function testDiscovery() {
  function element() {
    return { children: [], dataset: {}, append(...items) { this.children.push(...items); }, replaceChildren(...items) { this.children = items; }, addEventListener() {} };
  }
  const items = element();
  const requests = [];
  const nearby = vm.createContext({
    URLSearchParams, Set, Math, Number,
    destinationCoordinates: { lat: 48.86, lon: 2.34 }, nearbyPlacesGeneration: 0, poiLayer: null, leafletMap: null,
    uiLanguage: () => 'en-US', uiText: key => key, formatDistance: value => `${value} m`,
    distanceBetween: () => 250,
    document: { getElementById: () => items, querySelectorAll: () => [], createElement: element, createTextNode: text => text },
    requestJson: async url => {
      const params = new URL(url).searchParams;
      requests.push(params);
      const [osm_key, osm_value] = params.getAll('osm_tag')[0].split(':');
      return { features: [{ geometry: { coordinates: [2.34, 48.86] }, properties: { name: 'Test place', osm_key, osm_value } }] };
    }
  });
  vm.runInContext(script.slice(script.indexOf('    async function loadNearbyPlaces'), script.indexOf('    function escapeHtml')), nearby);
  await vm.runInContext("loadNearbyPlaces('all')", nearby);
  assert.equal(requests.length, 7);
  assert.equal(items.children.length, 7, 'all categories must render results');
  assert.ok(requests.some(p => p.getAll('osm_tag').includes('tourism:hotel')));
  assert.ok(requests.some(p => p.getAll('osm_tag').includes('tourism:motel')));
  assert.ok(requests.some(p => p.getAll('osm_tag').includes('leisure:bowling_alley')));
  assert.ok(requests.some(p => p.getAll('osm_tag').includes('amenity:cinema')));
  assert.ok(requests.every(p => p.get('radius') === '5' && p.get('lang') === 'en'));
  nearby.requestJson = async () => { throw new Error('offline'); };
  await vm.runInContext("loadNearbyPlaces('hotel')", nearby);
  assert.equal(items.children[0].textContent, 'nearbyUnavailable', 'an outage must not be reported as no results');
  console.log('PASS: nearby category queries, rendering, language and service failure handling');
}
testDiscovery().catch(error => { console.error(error); process.exitCode = 1; });
