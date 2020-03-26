import { RowType } from '../common/row.interface';

export interface HierarchicalRowType extends RowType {
    ghostRow: boolean;
}
