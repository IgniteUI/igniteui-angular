/**
 * `ng-element-strategy.ts` is a verbatim copy of Angular's `ComponentNgElementStrategy` and
 * references the `Zone` global type. The Elements app is zoneless and never imports `zone.js`,
 * so nothing pulls in its ambient declarations - this reference provides the types only and
 * emits no runtime code, keeping the copied file identical to upstream.
 */
/// <reference types="zone.js" />
