export class Mulberry32 {
    private seed: number;

    constructor(s: number) {
        this.seed = s;
    }

    public random(): number {
        /* eslint-disable */
        this.seed |= 0; this.seed = this.seed + 0x6D2B79F5 | 0;
        let t = Math.imul(this.seed ^ this.seed >>> 15, 1 | this.seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
        /* eslint-enable */
    }
}
