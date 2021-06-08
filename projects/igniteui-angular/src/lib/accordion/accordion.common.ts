import { mkenum } from '../core/utils';

// Enums
export const IgxAccordionExpansionMode = mkenum({
    Single: 'Single',
    Multiple: 'Multiple'
});
export type IgxAccordionExpansionMode = (typeof IgxAccordionExpansionMode)[keyof typeof IgxAccordionExpansionMode];
