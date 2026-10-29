const assert = require('node:assert/strict');
const core = require('../navigation-core.js');
function encode(points) {
  let lat = 0, lon = 0, result = '';
  for (const p of points) {
    const next = p.map(n => Math.round(n * 1e6));
    for (let delta of [next[0] - lat, next[1] - lon]) {
      delta = delta < 0 ? ~(delta << 1) : delta << 1;
      while (delta >= 32) { result += String.fromCharCode((32 | (delta & 31)) + 63); delta >>>= 5; }
      result += String.fromCharCode(delta + 63);
    }
    [lat, lon] = next;
  }
  return result;
}
const edge = (points, extra = {}) => ({distance: 100, relativeDirection: 'CONTINUE', streetName: '', fromLevel: 0, toLevel: 0, polyline: {points: encode(points), precision: 6}, ...extra});
const leg = {mode: 'WALK', to: {name: 'END'}, steps: [
  edge([[48,2],[48.001,2]]),
  edge([[48.001,2],[48.001,2.001]], {osmWay: 123}),
  edge([[48.001,2.001],[48.002,2.001]], {osmWay: 456}),
  edge([[48.002,2.001],[48.003,2.001]], {osmWay: 456})
]};
const steps = core.transitSteps({legs: [leg]}, 'fr-FR', {destination: 'Musée'});
assert.match(steps[1].title, /droite/);
assert.match(steps[2].title, /gauche/);
assert.equal(steps[2].detail.split(' · ')[0], '200 m', 'merge straight edges without losing the preceding turn');
assert.equal(steps.at(-1).detail, 'Musée');
assert.ok(!JSON.stringify(steps).includes('END'));
const stairLeg = {...leg, steps: [edge([[48,2],[48.001,2]], {relativeDirection:'STAIRS', toLevel:-1}), edge([[48.001,2],[48.002,2]], {fromLevel:-1,toLevel:-1})]};
assert.equal(core.walkingSteps(stairLeg).length, 2, 'do not include a corridor in staircase distance');
const exitLeg = {...leg, steps: [edge([[48,2],[48.001,2]], {exit:'1', streetName:'Rue du Musée'})]};
assert.match(core.transitSteps({legs:[exitLeg]})[0].title, /sortie 1.*Rue du Musée/);
assert.ok(!steps.some(step => step.title.includes('sortie')), 'do not invent a numbered exit');
assert.match(core.transitSteps({legs:[{mode:'WALK',to:{name:'Gare'}}]})[0].detail,/non fournies/);
(async () => {
  const itinerary = {legs:[leg]};
  const named = await core.fillStreetNames(itinerary, async () => ({ok:true,json:async()=>({elements:[{type:'way',id:123,tags:{name:'Rue A'}},{type:'way',id:456,tags:{name:'Rue B'}}]})}));
  assert.equal(named.legs[0].steps[1].streetName, 'Rue A');
  assert.equal(itinerary.legs[0].steps[1].streetName, '', 'keep original itinerary unchanged');
  const failed = {legs:[{...leg,steps:[{...leg.steps[0],osmWay:987}]}]};
  assert.equal(await core.fillStreetNames(failed, async()=>{throw Error('offline');}), failed, 'name service failure retains directions');
  console.log('PASS: geometric left/right turns, distances, stairs, actual exits, destination labels and resilient street-name lookup');
})().catch(error=>{console.error(error);process.exitCode=1;});
