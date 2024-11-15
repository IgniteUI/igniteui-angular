import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxTree
 */
export const TreeResourceStringsDE = {
    igx_expand: 'Erweitern',
    igx_collapse: 'Reduzieren'
} satisfies MakeRequired<ITreeResourceStrings>;
