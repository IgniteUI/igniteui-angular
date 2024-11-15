import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxTree
 */
export const TreeResourceStringsHU = {
    igx_expand: 'Kibontás',
    igx_collapse: 'Összecsukás',
} satisfies MakeRequired<ITreeResourceStrings>;
