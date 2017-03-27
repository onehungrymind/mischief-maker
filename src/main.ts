import './polyfills.ts';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

// -------------------------------------------------------------------
// START: HACK
// -------------------------------------------------------------------

let ctxName = 'theAudioContext';

// hackity hack - get audio context outside of an Angular module
window[ctxName] = new (window['AudioContext'] || window['webkitAudioContext'])();

// -------------------------------------------------------------------
// END: HACK
// -------------------------------------------------------------------

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);