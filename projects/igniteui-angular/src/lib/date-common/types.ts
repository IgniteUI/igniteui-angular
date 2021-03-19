import { mkenum } from '../core/utils';
/** Header orientation in `dialog` mode. */
export const HeaderOrientation = mkenum({
    Horizontal: 'horizontal',
    Vertical: 'vertical'
});
export type HeaderOrientation = (typeof HeaderOrientation)[keyof typeof HeaderOrientation];
