import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxTree
 */
export const TreeResourceStringsNB = {
    igx_expand: 'Vis',
    igx_collapse: 'Skjul'
} satisfies MakeRequired<ITreeResourceStrings>;
