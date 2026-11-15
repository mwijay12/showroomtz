/**
 * Regenerates src/components/effects/tanzania-geo.ts from Natural Earth data.
 *
 *   npm i --no-save world-atlas@2 topojson-client@3 @geo-maps/earth-lakes-10km
 *   node scripts/generate-tanzania-map.mjs
 *
 * Output: country polygons + lakes projected into a 1000x971 Mercator frame
 * fitted to Tanzania's bounding box, plus projected city coordinates.
 */

import fs from 'fs';
import * as topojson from 'topojson-client';

const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json','utf8'));
const fc = topojson.feature(topo, topo.objects.countries);
const tz = fc.features.find(f => String(f.id) === '834');
const polys = tz.geometry.coordinates;

const bboxLon=[29.324093240932427,40.46260462604627], bboxLat=[-11.715660255040035,-0.9941029244667305];
const merc=([lon,lat])=>[lon*Math.PI/180, Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))];
const [x0]=merc([bboxLon[0],bboxLat[0]]), [x1,y1]=merc([bboxLon[1],bboxLat[1]]);
const W=1000, PAD=14, scale=(W-PAD*2)/(x1-x0);
const H=Math.round((y1-merc([bboxLon[1],bboxLat[0]])[1])*scale+PAD*2);
const project=([lon,lat])=>{const [x,y]=merc([lon,lat]); return [+(((x-x0)*scale)+PAD).toFixed(1), +(((y1-y)*scale)+PAD).toFixed(1)];};
const ringPath=(ring,tol=0.9)=>{
  const pts=ring.map(project); const o=[]; let l=null;
  for(const p of pts){ if(!l||Math.hypot(p[0]-l[0],p[1]-l[1])>tol){o.push(p);l=p;} }
  if(o.length<4) return '';
  return 'M'+o.map(p=>`${Math.round(p[0])} ${Math.round(p[1])}`).join('L')+'Z';
};
const land = polys.map(poly=>poly.map(r=>ringPath(r)).filter(Boolean).join(' ')).filter(Boolean).join(' ');

// lakes
const geo = JSON.parse(fs.readFileSync('node_modules/@geo-maps/earth-lakes-10km/map.geo.json','utf8'));
const mp = geo.geometries[0].coordinates;
const picks=[];
for (const poly of mp) {
  let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
  for (const r of poly) for (const c of r){minx=Math.min(minx,c[0]);maxx=Math.max(maxx,c[0]);miny=Math.min(miny,c[1]);maxy=Math.max(maxy,c[1]);}
  if (maxx<29.2||minx>40.5||maxy<-11.8||miny>-0.9) continue;
  // skip lakes fully outside country: rough center test against land bbox only
  const d = poly.map(r=>ringPath(r,0.9)).filter(Boolean).join(' ');
  if (!d) continue;
  picks.push({d, area:(maxx-minx)*(maxy-miny), box:[minx,maxx,miny,maxy]});
}
picks.sort((a,b)=>b.area-a.area);
// keep the four recognisable Rift lakes + Victoria/Tanganyika/Nyasa/Rukwa
const lakePaths = picks.slice(0,6).map(p=>p.d);
console.log('lakes', picks.slice(0,6).map(p=>p.box.map(n=>+n.toFixed(2))), 'chars', lakePaths.join('').length);

const cities = {
  dar: { lon: 39.2083, lat: -6.7924, label: 'Dar es Salaam', hq: true },
  dodoma: { lon: 35.7395, lat: -6.1629, label: 'Dodoma' },
  arusha: { lon: 36.6820, lat: -3.3869, label: 'Arusha' },
  mwanza: { lon: 32.9000, lat: -2.5164, label: 'Mwanza' },
  zanzibar: { lon: 39.1979, lat: -6.1659, label: 'Zanzibar' },
  mbeya: { lon: 33.4600, lat: -8.9094, label: 'Mbeya' },
  tanga: { lon: 39.0988, lat: -5.0689, label: 'Tanga' },
};
const cityOut = Object.fromEntries(Object.entries(cities).map(([k,v])=>[k,{...v, x:project([v.lon,v.lat])[0], y:project([v.lon,v.lat])[1]}]));

const ts = `/**
 * Real geography for the delivery map — GENERATED, do not hand-edit.
 *
 * Source: Natural Earth 1:50m country polygons (\`world-atlas@2\`) and
 * 10m lake polygons (\`@geo-maps/earth-lakes-10km\`), projected to a
 * Mercator frame fitted to Tanzania's bounding box
 * (29.32°E–40.46°E, 11.72°S–0.99°S) and rounded to 1px in a ${W}×${H} viewBox.
 *
 * Regenerate with: node scripts/generate-tanzania-map.mjs
 */

export const TZ_VIEWBOX = '0 0 ${W} ${H}';

/** Mainland + Zanzibar + Pemba + Mafia. */
export const TZ_LAND =
  '${land}';

/** Lake Victoria, Tanganyika, Nyasa and the Rift lakes, as separate subpaths. */
export const TZ_LAKES = [
${lakePaths.map(p=>`  '${p}',`).join('\n')}
];

export type TanzanianCity = {
  lon: number;
  lat: number;
  x: number;
  y: number;
  label: string;
  hq?: boolean;
};

export const TZ_CITIES: Record<string, TanzanianCity> = ${JSON.stringify(cityOut, null, 2).replace(/"([a-z]+)": \{/g, '$1: {')};
`;
fs.writeFileSync(new URL('../src/components/effects/tanzania-geo.ts', import.meta.url), ts);
console.log('land chars', land.length, 'total file', ts.length, 'H', H);
