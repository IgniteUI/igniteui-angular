import { IgxTransactionBaseService } from './transaction-base';
import { ITransaction, IChange, IState, ChangeType } from './utilities';

import { async, TestBed, fakeAsync } from '@angular/core/testing';

describe('Transactions', () => {
    it('Add ADD type change - all possible paths', fakeAsync(() => {
        const trans = new IgxTransactionBaseService();
        expect(trans).toBeDefined();

        // ADD
        const addChange: IChange = { id: '1', type: ChangeType.ADD, newValue: 1 };
        trans.add(addChange);
        expect(trans.get('1')).toEqual(addChange);
        expect(trans.getAll()).toEqual([addChange]);
        expect(trans.currentState().get(addChange.id)).toEqual({
            value: addChange.newValue,
            originalValue: undefined,
            type: addChange.type
        });
        trans.reset();
        expect(trans.getAll()).toEqual([]);
        expect(trans.currentState()).toEqual(new Map());

        // ADD -> Undo
        trans.add(addChange);
        trans.undo();
        expect(trans.getAll()).toEqual([]);
        expect(trans.currentState()).toEqual(new Map());
        trans.reset();

        // ADD -> Undo -> Redo
        trans.add(addChange);
        trans.undo();
        trans.redo();
        expect(trans.getAll()).toEqual([addChange]);
        expect(trans.currentState().get(addChange.id)).toEqual({
            value: addChange.newValue,
            originalValue: undefined,
            type: addChange.type
        });
        trans.reset();

        // ADD -> DELETE
        trans.add(addChange);
        const deleteChange: IChange = { id: '1', type: ChangeType.DELETE, newValue: 1 };
        trans.add(deleteChange);
        expect(trans.getAll()).toEqual([addChange, deleteChange]);
        expect(trans.currentState()).toEqual(new Map());
        trans.reset();

        // ADD -> DELETE -> Undo
        trans.add(addChange);
        trans.add(deleteChange);
        trans.undo();
        expect(trans.getAll()).toEqual([addChange]);
        expect(trans.currentState().get(addChange.id)).toEqual({
            value: addChange.newValue,
            originalValue: undefined,
            type: addChange.type
        });
        trans.reset();

        // ADD -> DELETE -> Undo -> Redo
        trans.add(addChange);
        trans.add(deleteChange);
        trans.undo();
        trans.redo();
        expect(trans.getAll()).toEqual([addChange, deleteChange]);
        expect(trans.currentState()).toEqual(new Map());
        trans.reset();

        // ADD -> DELETE -> Undo -> Undo
        trans.add(addChange);
        trans.add(deleteChange);
        trans.undo();
        trans.undo();
        expect(trans.getAll()).toEqual([]);
        expect(trans.currentState()).toEqual(new Map());
        trans.reset();

        // ADD -> UPDATE
        trans.add(addChange);
        const updateChange: IChange = { id: '1', type: ChangeType.UPDATE, newValue: 2 };
        trans.add(updateChange);
        expect(trans.getAll()).toEqual([addChange, updateChange]);
        expect(trans.currentState().get(addChange.id)).toEqual({
            value: updateChange.newValue,
            originalValue: undefined,
            type: addChange.type
        });
        trans.reset();

        // ADD -> UPDATE -> Undo
        trans.add(addChange);
        trans.add(updateChange);
        trans.undo();
        expect(trans.getAll()).toEqual([addChange]);
        expect(trans.currentState().get(addChange.id)).toEqual({
            value: addChange.newValue,
            originalValue: undefined,
            type: addChange.type
        });
        trans.reset();

        // ADD -> UPDATE -> Undo -> Redo
        trans.add(addChange);
        trans.add(updateChange);
        trans.undo();
        trans.redo();
        expect(trans.getAll()).toEqual([addChange, updateChange]);
        expect(trans.currentState().get(addChange.id)).toEqual({
            value: updateChange.newValue,
            originalValue: undefined,
            type: addChange.type
        });
        trans.reset();
    }));
});
