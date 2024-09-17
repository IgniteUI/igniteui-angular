import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxTree
 */
export const TreeResourceStringsIT = {
    igx_expand: 'Espandi',
    igx_collapse: 'Comprimi'
} satisfies MakeRequired<ITreeResourceStrings>;
