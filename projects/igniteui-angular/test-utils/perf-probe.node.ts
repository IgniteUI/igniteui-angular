// Opt-in performance probe for the library specs, node half (see perf-probe.spec.ts for the browser half).
//
//   IGX_PERF_PROBE=1 ng test igniteui-angular ...
//
//   spec file ──afterAll──▶ commands.probe(label, summary) ──▶ CDP (GC, DOM/heap/layout counters)
//                                                         └──▶ .angular/perf-probe/<run>.jsonl (one line per file)
//
// IGX_PERF_PROBE_WAIT_CAP=frame additionally replaces every `wait(ms)` sleep with one animation frame,
// to find which sleeps the specs really need.

import { appendFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BrowserCommand, BrowserCommandContext } from 'vitest/node';

/** Minimal shape of the Playwright CDP session the provider hands out. */
interface ProbeCdp {
    send<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T>;
}

interface PerfMetric {
    name: string;
    value: number;
}

/** Cumulative per-page counters worth keeping from `Performance.getMetrics`. */
const KEPT_METRICS = new Set([
    'Documents', 'Nodes', 'JSEventListeners', 'LayoutCount', 'RecalcStyleCount',
    'LayoutDuration', 'RecalcStyleDuration', 'ScriptDuration', 'TaskDuration', 'JSHeapUsedSize'
]);

const enabled = !!process.env['IGX_PERF_PROBE'];
const waitCap = process.env['IGX_PERF_PROBE_WAIT_CAP'] ?? '';
const sessions = new Map<string, Promise<ProbeCdp>>();

let outFile = '';

/** One CDP session per page; `Performance.enable` once, as the metrics are cumulative per session. */
const cdpFor = (ctx: BrowserCommandContext) => {
    let session = sessions.get(ctx.sessionId);

    if (!session) {
        session = (ctx.provider.getCDPSession!(ctx.sessionId) as unknown as Promise<ProbeCdp>)
            .then(async cdp => {
                await cdp.send('Performance.enable');
                return cdp;
            });
        sessions.set(ctx.sessionId, session);
    }

    return session;
};

const probe: BrowserCommand<[label: string, data: unknown]> = async (ctx, label, data) => {
    const cdp = await cdpFor(ctx);

    // Settle garbage first, so the counters show what the page retains, not what it churns.
    await cdp.send('HeapProfiler.collectGarbage');

    const [dom, heap, perf] = await Promise.all([
        cdp.send('Memory.getDOMCounters'),
        cdp.send('Runtime.getHeapUsage'),
        cdp.send<{ metrics: PerfMetric[] }>('Performance.getMetrics')
    ]);
    const metrics = Object.fromEntries(perf.metrics.filter(m => KEPT_METRICS.has(m.name)).map(m => [m.name, m.value]));

    appendFileSync(outFile, JSON.stringify({ file: ctx.testPath, page: ctx.sessionId, label, dom, heap, metrics, data }) + '\n');
};

/**
 * Vitest `test` options that switch the probe on. Empty when IGX_PERF_PROBE is not set,
 * so a normal run is untouched.
 */
export const perfProbeOptions = (workspaceRoot: string) => {
    if (!enabled) {
        return {};
    }

    const outDir = resolve(workspaceRoot, '.angular/perf-probe');
    mkdirSync(outDir, { recursive: true });
    outFile = resolve(outDir, `${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`);
    console.log(`[perf-probe] writing ${outFile}`);

    return {
        provide: { perfProbe: true, perfProbeWaitCap: waitCap },
        browser: { commands: { probe } }
    };
};
