import { mkenum } from '../../core/utils';

export const TooltipPlacement = /*@__PURE__*/mkenum({
    top: 'top',
    topStart: 'top-start',
    topEnd: 'top-end',
    bottom: 'bottom',
    bottomStart: 'bottom-start',
    bottomEnd: 'bottom-end',
    right: 'right',
    rightStart: 'right-start',
    rightEnd: 'right-end',
    left: 'left',
    leftStart: 'left-start',
    leftEnd: 'left-end'
});
export type TooltipPlacement = (typeof TooltipPlacement)[keyof typeof TooltipPlacement];
