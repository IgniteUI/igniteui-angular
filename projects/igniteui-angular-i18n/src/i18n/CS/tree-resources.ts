import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxTree
 */
export const TreeResourceStringsCS = {
    igx_expand: 'Rozbalit',
    igx_collapse: 'Sbalit'
} satisfies MakeRequired<ITreeResourceStrings>;
