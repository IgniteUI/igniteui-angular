import { LNode, LNodeType } from './interfaces/node';
export declare function assertNodeType(node: LNode, type: LNodeType): void;
export declare function assertNodeOfPossibleTypes(node: LNode, ...types: LNodeType[]): void;
