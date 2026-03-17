// projects/igniteui-angular/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      screenshotFailures: false
    }
  }
});