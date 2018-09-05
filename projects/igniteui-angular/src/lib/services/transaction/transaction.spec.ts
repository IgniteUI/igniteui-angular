import { IgxTransactionBaseService } from './transaction-base';
import { ITransaction, IChange, IState, ChangeType } from './utilities';

import { async, TestBed, fakeAsync } from '@angular/core/testing';

fdescribe('IgxTransaction', () => {
    describe('IgxTransaction UNIT tests', () => {
        it('Add ADD type change - all feasible paths', () => {
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
        });

        it('Add DELETE type change - all feasible paths', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            // DELETE
            const originalValue = { key: 'Key1', value: 1 };
            const deleteChange: IChange = { id: 'Key1', type: ChangeType.DELETE, newValue: null };
            trans.add(deleteChange, originalValue);
            expect(trans.get('Key1')).toEqual(deleteChange);
            expect(trans.getAll()).toEqual([deleteChange]);
            expect(trans.currentState().get(deleteChange.id)).toEqual({
                value: deleteChange.newValue,
                originalValue: originalValue,
                type: deleteChange.type
            });
            trans.reset();
            expect(trans.getAll()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());

            // DELETE -> Undo
            trans.add(deleteChange, originalValue);
            trans.undo();
            expect(trans.getAll()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());
            trans.reset();

            // DELETE -> Undo -> Redo
            trans.add(deleteChange, originalValue);
            trans.undo();
            trans.redo();
            expect(trans.get('Key1')).toEqual(deleteChange);
            expect(trans.getAll()).toEqual([deleteChange]);
            expect(trans.currentState().get(deleteChange.id)).toEqual({
                value: deleteChange.newValue,
                originalValue: originalValue,
                type: deleteChange.type
            });
            trans.reset();
        });

        it('Add UPDATE type change - all feasible paths', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            // UPDATE
            const originalValue = { key: 'Key1', value: 1 };
            const newValue = { key: 'Key1', value: 2 };
            const updateChange: IChange = { id: 'Key1', type: ChangeType.UPDATE, newValue: newValue };
            trans.add(updateChange, originalValue);
            expect(trans.get('Key1')).toEqual(updateChange);
            expect(trans.getAll()).toEqual([updateChange]);
            expect(trans.currentState().get(updateChange.id)).toEqual({
                value: updateChange.newValue,
                originalValue: originalValue,
                type: updateChange.type
            });
            trans.reset();
            expect(trans.getAll()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());

            // UPDATE -> Undo
            trans.add(updateChange, originalValue);
            trans.undo();
            expect(trans.getAll()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());
            trans.reset();

            // UPDATE -> Undo -> Redo
            trans.add(updateChange, originalValue);
            trans.undo();
            trans.redo();
            expect(trans.get('Key1')).toEqual(updateChange);
            expect(trans.getAll()).toEqual([updateChange]);
            expect(trans.currentState().get(updateChange.id)).toEqual({
                value: updateChange.newValue,
                originalValue: originalValue,
                type: updateChange.type
            });
            trans.reset();

            // UPDATE -> UPDATE
            trans.add(updateChange, originalValue);
            const newValue2 = { key: 'Key1', value: 2 };
            const updateChange2: IChange = { id: 'Key1', type: ChangeType.UPDATE, newValue: newValue2 };
            trans.add(updateChange, originalValue);
            expect(trans.get('Key1')).toEqual(updateChange2);
            expect(trans.getAll()).toEqual([updateChange, updateChange]);
            expect(trans.currentState().get(updateChange.id)).toEqual({
                value: updateChange2.newValue,
                originalValue: originalValue,
                type: updateChange2.type
            });
            trans.reset();

            // UPDATE -> UPDATE -> Undo
            trans.add(updateChange, originalValue);
            trans.add(updateChange, originalValue);
            trans.undo();
            expect(trans.get('Key1')).toEqual(updateChange);
            expect(trans.getAll()).toEqual([updateChange]);
            expect(trans.currentState().get(updateChange.id)).toEqual({
                value: updateChange.newValue,
                originalValue: originalValue,
                type: updateChange.type
            });
            trans.reset();

            // UPDATE -> UPDATE -> Undo -> Redo
            trans.add(updateChange, originalValue);
            trans.add(updateChange, originalValue);
            trans.undo();
            trans.redo();
            expect(trans.get('Key1')).toEqual(updateChange2);
            expect(trans.getAll()).toEqual([updateChange, updateChange]);
            expect(trans.currentState().get(updateChange.id)).toEqual({
                value: updateChange2.newValue,
                originalValue: originalValue,
                type: updateChange2.type
            });
            trans.reset();

            // UPDATE -> DELETE
            trans.add(updateChange, originalValue);
            const deleteChange: IChange = { id: 'Key1', type: ChangeType.DELETE, newValue: null };
            trans.add(deleteChange);
            expect(trans.get('Key1')).toEqual(deleteChange);
            expect(trans.getAll()).toEqual([updateChange, deleteChange]);
            expect(trans.currentState().get(deleteChange.id)).toEqual({
                value: deleteChange.newValue,
                originalValue: originalValue,
                type: deleteChange.type
            });
            trans.reset();

            // UPDATE -> DELETE -> Undo
            trans.add(updateChange, originalValue);
            trans.add(deleteChange);
            trans.undo();
            expect(trans.get('Key1')).toEqual(updateChange);
            expect(trans.getAll()).toEqual([updateChange]);
            expect(trans.currentState().get(updateChange.id)).toEqual({
                value: updateChange.newValue,
                originalValue: originalValue,
                type: updateChange.type
            });
            trans.reset();

            // UPDATE -> DELETE -> Undo -> Redo
            trans.add(updateChange, originalValue);
            trans.add(deleteChange);
            trans.undo();
            trans.redo();
            expect(trans.get('Key1')).toEqual(deleteChange);
            expect(trans.getAll()).toEqual([updateChange, deleteChange]);
            expect(trans.currentState().get(deleteChange.id)).toEqual({
                value: deleteChange.newValue,
                originalValue: originalValue,
                type: deleteChange.type
            });
            trans.reset();
        });
    });
});

