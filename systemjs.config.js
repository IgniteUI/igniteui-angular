/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'npm:': 'https://unpkg.com/'
    },
    meta: {
      'typescript': {
        'exports': 'ts'
      }
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the demos/ folder
      app: 'demos/',
      // angular bundles
      '@angular/animations': 'npm:@angular/animations/bundles/animations.umd.js',
      '@angular/animations/browser': 'npm:@angular/animations/bundles/animations-browser.umd.js',
      '@angular/platform-browser/animations': 'npm:@angular/platform-browser/bundles/platform-browser-animations.umd.js',
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
      // other libraries
      'rxjs':                       'npm:rxjs',
      'angular2-in-memory-web-api': 'npm:angular2-in-memory-web-api',
      'ts':                         'npm:plugin-typescript@7.0.6/lib/plugin.js',
      'typescript':                 'npm:typescript@2.3.2/lib/typescript.js',
      'prism':                      'npm:prismjs@1.5.1',
      'igniteui-js-blocks':                'npm:igniteui-js-blocks'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.ts',
        defaultExtension: 'ts'
      },
      rxjs: {
        defaultExtension: 'js'
      },
      'angular2-in-memory-web-api': {
        main: './index.js',
        defaultExtension: 'js'
      },
      'igniteui-js-blocks': {
        defaultExtension: 'js'
      },
      'prism': {
        defaultExtension: 'js'
      }
    },
    transpiler: 'ts',
    typescriptOptions: {
      "target": "es5",
      "module": "commonjs",
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
    }
  });
})(this);
