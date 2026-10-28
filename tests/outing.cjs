const assert = require('node:assert/strict');
const {distance, routeProximity, sampleRoute, fitsTime} = require('../outing-core.js');

// A place in the middle of a long segment is on-route even with sparse geometry.
const route = [[2,48], [2.02,48], [2.02,48.02]];
assert.ok(routeProximity({lon:2.01,lat:48}, route).distance < 0.01);
assert.ok(routeProximity({lon:2.01,lat:48.01}, route).distance > 600);
assert.ok(routeProximity({lon:2.02,lat:48.01}, route).progress > routeProximity({lon:2.01,lat:48}, route).progress);
assert.ok(Number.isFinite(routeProximity({lon:2,lat:48}, [[2,48],[2,48]]).distance));
assert.equal(distance({lat:48,lon:2},{lat:48,lon:2}),0);

// Sample by distance, not index: unevenly spaced vertices must not cluster searches.
const line = [[2,48],[2.001,48],[2.002,48],[2.03,48]];
const samples = sampleRoute(line);
assert.equal(samples.length,4);
assert.ok(Math.abs(samples[1].lon-2.01) < 0.00001);
assert.ok(Math.abs(samples[2].lon-2.02) < 0.00001);
assert.deepEqual(sampleRoute([]),[]);
assert.equal(samples[0].lon,2);
assert.equal(samples.at(-1).lon,2.03);

assert.equal(fitsTime(30*60, 35*60, 20, 60, 10),true);
assert.equal(fitsTime(30*60, 45*60, 10, 60, 10),false,'reject too much detour');
assert.equal(fitsTime(30*60, 35*60, 30, 60, 10),false,'count the pause in available time');
assert.equal(fitsTime(30*60, 30*60, 30, 60, 0),true,'accept exact time boundary');
assert.equal(fitsTime(30*60, 29*60, 20, 60, 0),true,'routing variations must not create negative detours');
console.log('PASS: route corridor geometry, route order, distance sampling, real detour and visit time limits');
