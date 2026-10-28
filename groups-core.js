(function(root) {
  'use strict';
  const TYPES = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov'};
  function validMedia(file) { return Boolean(file && TYPES[file.type] && file.size > 0 && file.size <= 50 * 1024 * 1024); }
  function live(point, now=Date.now()) { return Number.isFinite(point.lat) && Number.isFinite(point.lon) && Math.abs(point.lat)<=90 && Math.abs(point.lon)<=180 && Date.parse(point.expires_at)>now && now-Date.parse(point.updated_at)<90000 && Date.parse(point.updated_at)<=now+5000; }
  function invitation(value) { const token=String(value).trim().toLowerCase(); return /^[a-f0-9]{32}$/.test(token) ? token : ''; }
  const api={TYPES,validMedia,live,invitation};
  if(typeof module!=='undefined' && module.exports) module.exports=api; else root.NavigueGroupsCore=api;
})(typeof window!=='undefined'?window:globalThis);
