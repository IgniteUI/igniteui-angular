import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Japanese resource strings for IgxTree
 */
export const TreeResourceStringsJA = {
    igx_expand: '展開',
    igx_collapse: '縮小'
} satisfies MakeRequired<ITreeResourceStrings>;
