import { IgxTransactionBaseService } from './transaction-base';
import { ITransaction, IChange, IState, ChangeType } from './utilities';

import { async, TestBed, fakeAsync } from '@angular/core/testing';

describe('Transactions', () => {
    fit('Add ADD type change - all possible paths', fakeAsync(() => {
        const trans = new IgxTransactionBaseService();
        expect(trans).toBeDefined();
        const change: IChange = { id: '1', type: ChangeType.ADD, newValue: 1 };
        trans.add(change);
        expect(trans.get('1')).toEqual(change);
        expect(trans.getAll()).toEqual([change]);
        expect(trans.currentState().get(change.id)).toEqual({ value: change.newValue, originalValue: undefined, type: change.type });
    }));
});
