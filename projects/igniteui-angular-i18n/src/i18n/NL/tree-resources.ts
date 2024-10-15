import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxTree
 */
export const TreeResourceStringsNL = {
    igx_expand: 'Uitvouwen',
    igx_collapse: 'Samenvouwen'
} satisfies MakeRequired<ITreeResourceStrings>;
