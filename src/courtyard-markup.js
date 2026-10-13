import {coverAtmosphereMarkup} from './cover-atmosphere.js';

export function courtyardArtwork(){return `<div class="courtyard-camera">
 <img class="courtyard-landscape" data-src="/assets/png/courtyard/morning-garden.png" alt=""/>
 <img class="courtyard-clouds" data-src="/assets/png/arrival/clouds.png" alt=""/>
 <img class="courtyard-clouds clouds-far" data-src="/assets/png/arrival/clouds.png" alt=""/>
 <img class="courtyard-shrub shrub-left" data-src="/assets/png/clockroom/garden-shrub.png" alt=""/>
 <img class="courtyard-shrub shrub-right" data-src="/assets/png/clockroom/garden-shrub.png" alt=""/>
 <div class="courtyard-gates"><img class="courtyard-leaf courtyard-left" data-src="/assets/png/courtyard/gate-left.png" alt=""/><img class="courtyard-leaf courtyard-right" data-src="/assets/png/courtyard/gate-right.png" alt=""/></div>
 <img class="courtyard-tree courtyard-tree-left" data-src="/assets/png/arrival/tree.png" alt=""/>
 <img class="courtyard-tree courtyard-tree-right" data-src="/assets/png/arrival/tree.png" alt=""/>
 </div><div class="courtyard-crow"><img class="crow-up" data-src="/assets/png/maproom/raven-up.png" alt=""/><img class="crow-down" data-src="/assets/png/maproom/raven-down.png" alt=""/></div><div class="courtyard-light"></div><header class="courtyard-heading"><span>PART II</span><h1 id="gate-title">Di balik gerbang</h1><img src="/assets/png/arrival/ui-divider.png" alt=""/></header>`;}
export function courtyardCover(){return `<img class="courtyard-landscape courtyard-title-garden" data-src="/assets/png/courtyard/morning-garden.png" alt=""/><div class="courtyard-light"></div><div class="courtyard-title-shade"></div>${coverAtmosphereMarkup()}`;}
export function courtyardTitle(){return `<h1 id="cover-title" class="sr-only">The Wedding of Bifari & Syafira</h1><div class="wedding-logo" aria-hidden="true"><img class="logo-original" data-src="/assets/png/title/wedding-logo.png" width="1891" height="831" alt=""/><canvas class="logo-growth" hidden></canvas></div>`;}


