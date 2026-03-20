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

    private snackbar = viewChild<IgxSnackbarComponent>('snackbar');

    public copiedHex = '';

    public colors: ColorGroup[] = [
        buildGroup('primary', COLOR_SHADES),
        buildGroup('secondary', COLOR_SHADES),
        buildGroup('surface', COLOR_SHADES),
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
    }

    public copyHex(hex: string): void {
        if (hex) {
            navigator.clipboard.writeText(hex);
            this.copiedHex = hex;
            this.snackbar()?.open(`Copied ${hex} to clipboard`);
        }
    }

    private refreshHexValues(): void {
        const styles = getComputedStyle(this.el.nativeElement);

        for (const color of this.colors) {
            for (const variant of color.variants) {
                variant.hex = this.resolveHex(styles, color.name, variant.shade);
            }
        }

        this.cdr.markForCheck();
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

        return this.rgbToHex(resolved);
    }

    private rgbToHex(rgb: string): string {
        const match = rgb.match(/\d+/g);
        if (!match || match.length < 3) {
            return rgb;
        }
        const [r, g, b] = match.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
}
