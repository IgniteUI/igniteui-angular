import { Component, ElementRef, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, inject, viewChild, afterNextRender } from '@angular/core';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxSnackbarComponent } from 'igniteui-angular/snackbar';

interface ColorVariant {
    shade: string | number;
    hex: string;
}

interface ColorGroup {
    name: string;
    variants: ColorVariant[];
}

const COLOR_SHADES: (string | number)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 'A100', 'A200', 'A400', 'A700'];
const GRAY_SHADES: (string | number)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const SURFACE_ROLES: string[] = ['base', 'sunken', 'raised', 'overlay', 'container'];

type Generator = 'legacy' | 'fitted';

/** The surface roles, plus the numbered shades that a legacy palette derives from `500`. */
function surfaceShades(generator: Generator): (string | number)[] {
    return generator === 'fitted' ? SURFACE_ROLES : [...SURFACE_ROLES, ...COLOR_SHADES];
}

function buildGroup(name: string, shades: (string | number)[]): ColorGroup {
    return {
        name,
        variants: shades.map(shade => ({ shade, hex: '' }))
    };
}

@Component({
    selector: 'app-colors-sample',
    styleUrls: ['color.sample.scss'],
    templateUrl: 'color.sample.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxIconComponent, IgxSnackbarComponent]
})
export class ColorsSampleComponent implements OnDestroy {
    private el = inject(ElementRef<HTMLElement>);
    private cdr = inject(ChangeDetectorRef);
    private observer: MutationObserver;
    private canvasCtx: CanvasRenderingContext2D | null = null;

    private snackbar = viewChild<IgxSnackbarComponent>('snackbar');

    public copiedHex = '';
    public generator: Generator = 'legacy';

    public colors: ColorGroup[] = [
        buildGroup('primary', COLOR_SHADES),
        buildGroup('secondary', COLOR_SHADES),
        buildGroup('surface', surfaceShades(this.generator)),
        buildGroup('gray', GRAY_SHADES),
        buildGroup('success', COLOR_SHADES),
        buildGroup('info', COLOR_SHADES),
        buildGroup('warn', COLOR_SHADES),
        buildGroup('error', COLOR_SHADES),
    ];

    constructor() {
        afterNextRender(() => {
            this.refreshHexValues();

            // Re-resolve hex values when the palette changes at runtime
            this.observer = new MutationObserver(() => this.refreshHexValues());
            this.observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        });
    }

    public ngOnDestroy(): void {
        this.observer?.disconnect();
        this.canvasCtx = null;
    }

    public copyHex(hex: string): void {
        if (hex) {
            navigator.clipboard.writeText(hex);
            this.copiedHex = hex;
            this.snackbar()?.open(`Copied ${hex} to clipboard`);
        }
    }

    /** The color shown in the title of a group: `base` for the surface, `500` for the rest. */
    public titleShade(name: string): string | number {
        return name === 'surface' ? 'base' : 500;
    }

    private refreshHexValues(): void {
        const styles = getComputedStyle(this.el.nativeElement);
        const generator = this.detectGenerator(styles);

        if (generator !== this.generator) {
            this.generator = generator;
            this.colors = this.colors.map(color =>
                color.name === 'surface' ? buildGroup('surface', surfaceShades(generator)) : color
            );
        }

        for (const color of this.colors) {
            for (const variant of color.variants) {
                variant.hex = this.resolveHex(styles, color.name, variant.shade);
            }
        }

        this.cdr.markForCheck();
    }

    /**
     * A legacy palette emits its shades as relative colors of `500`, such as
     * `hsl(from var(--ig-primary-500) ...)`, while a fitted palette emits fixed colors.
     */
    private detectGenerator(styles: CSSStyleDeclaration): Generator {
        const shade = styles.getPropertyValue('--ig-primary-600');
        return /\(\s*from\s/.test(shade) ? 'legacy' : 'fitted';
    }

    private resolveHex(styles: CSSStyleDeclaration, name: string, shade: string | number): string {
        const raw = styles.getPropertyValue(`--ig-${name}-${shade}`).trim();
        if (!raw) {
            return '';
        }

        const temp = document.createElement('div');
        temp.style.color = raw;
        document.body.appendChild(temp);
        const resolved = getComputedStyle(temp).color;
        document.body.removeChild(temp);

        return this.colorToHex(resolved);
    }

    /**
     * Converts any resolved CSS color string to a hex value.
     * Uses a canvas to reliably handle all CSS color formats
     * (rgb, color(srgb), oklch, lab, etc.) that modern browsers
     * may return from getComputedStyle.
     */
    private colorToHex(color: string): string {
        if (!this.canvasCtx) {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            this.canvasCtx = canvas.getContext('2d');
        }

        const ctx = this.canvasCtx;
        if (!ctx) {
            return '';
        }

        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#000';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        // a translucent color, such as the surface container, keeps its alpha
        return a < 255 ? `${hex}${a.toString(16).padStart(2, '0').toUpperCase()}` : hex;
    }
}
