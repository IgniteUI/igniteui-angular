// projects/igniteui-angular/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
        // TODO: Fix this since it's mighty annoying to have to do this for every project
        'fflate': 'fflate/browser',
    }
  },
  test: {
    browser: {
      screenshotFailures: false
    }
  }
});
