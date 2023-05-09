import {
    IgxCardActionsComponent,
    IgxCardComponent,
    IgxCardContentDirective,
    IgxCardFooterDirective,
    IgxCardHeaderComponent,
    IgxCardHeaderSubtitleDirective,
    IgxCardHeaderTitleDirective,
    IgxCardMediaDirective,
    IgxCardThumbnailDirective
} from './card.component';

export * from './card.component';

/* NOTE: Card directives collection for ease-of-use import in standalone components scenario */
export const IGX_CARD_DIRECTIVES = [
    IgxCardComponent,
    IgxCardHeaderComponent,
    IgxCardMediaDirective,
    IgxCardContentDirective,
    IgxCardActionsComponent,
    IgxCardFooterDirective,
    IgxCardHeaderTitleDirective,
    IgxCardHeaderSubtitleDirective,
    IgxCardThumbnailDirective
] as const;
