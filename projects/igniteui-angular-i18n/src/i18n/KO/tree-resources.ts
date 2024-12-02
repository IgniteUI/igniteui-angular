import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxTree
 */
export const TreeResourceStringsKO = {
    igx_expand: '확장',
    igx_collapse: '축소'
} satisfies MakeRequired<ITreeResourceStrings>;
