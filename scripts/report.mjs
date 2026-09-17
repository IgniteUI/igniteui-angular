import { stdout } from 'node:process';
import { format } from 'node:util';

export default {
  error: (s) => console.error('\x1b[31m%s\x1b[0m', s),
  success: (s) => console.info('\x1b[32m%s\x1b[0m', s),
  warn: (s) => console.warn('\x1b[33m%s\x1b[0m', s),
  info: (s) => console.info('\x1b[36m%s\x1b[0m', s),

  stdout: {
    clearLine: () => {
      stdout.clearLine(0);
      stdout.cursorTo(0);
    },
    success: (s) => stdout.write(format('\x1b[32m%s\x1b[0m', s)),
    warn: (s) => stdout.write(format('\x1b[33m%s\x1b[0m', s)),
    info: (s) => stdout.write(format('\x1b[36m%s\x1b[0m', s)),
  },
};
