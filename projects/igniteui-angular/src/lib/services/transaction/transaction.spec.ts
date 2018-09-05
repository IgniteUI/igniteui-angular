import { IgxTransactionBaseService } from './transaction-base';
import { ITransaction, TransactionType } from './utilities';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

describe('IgxTransaction', () => {
    describe('IgxTransaction UNIT tests', () => {
        it('Add ADD type change - all feasible paths', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            // ADD
            const addTransaction: ITransaction = { id: '1', type: TransactionType.ADD, newValue: 1 };
            trans.add(addTransaction);
            expect(trans.getLastTransactionById('1')).toEqual(addTransaction);
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.currentState().get(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                originalValue: undefined,
                type: addTransaction.type
            });
            trans.reset();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());

            // ADD -> Undo
            trans.add(addTransaction);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());
            trans.reset();

            // ADD -> Undo -> Redo
            trans.add(addTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.currentState().get(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                originalValue: undefined,
                type: addTransaction.type
            });
            trans.reset();

            // ADD -> DELETE
            trans.add(addTransaction);
            const deleteTransaction: ITransaction = { id: '1', type: TransactionType.DELETE, newValue: 1 };
            trans.add(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([addTransaction, deleteTransaction]);
            expect(trans.currentState()).toEqual(new Map());
            trans.reset();

            // ADD -> DELETE -> Undo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.currentState().get(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                originalValue: undefined,
                type: addTransaction.type
            });
            trans.reset();

            // ADD -> DELETE -> Undo -> Redo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction, deleteTransaction]);
            expect(trans.currentState()).toEqual(new Map());
            trans.reset();

            // ADD -> DELETE -> Undo -> Undo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());
            trans.reset();

            // ADD -> UPDATE
            trans.add(addTransaction);
            const updateChange: ITransaction = { id: '1', type: TransactionType.UPDATE, newValue: 2 };
            trans.add(updateChange);
            expect(trans.getTransactionLog()).toEqual([addTransaction, updateChange]);
            expect(trans.currentState().get(addTransaction.id)).toEqual({
                value: updateChange.newValue,
                originalValue: undefined,
                type: addTransaction.type
            });
            trans.reset();

            // ADD -> UPDATE -> Undo
            trans.add(addTransaction);
            trans.add(updateChange);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.currentState().get(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                originalValue: undefined,
                type: addTransaction.type
            });
            trans.reset();

            // ADD -> UPDATE -> Undo -> Redo
            trans.add(addTransaction);
            trans.add(updateChange);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction, updateChange]);
            expect(trans.currentState().get(addTransaction.id)).toEqual({
                value: updateChange.newValue,
                originalValue: undefined,
                type: addTransaction.type
            });
            trans.reset();
        });

        it('Add DELETE type change - all feasible paths', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            // DELETE
            const originalValue = { key: 'Key1', value: 1 };
            const deleteTransaction: ITransaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, originalValue);
            expect(trans.getLastTransactionById('Key1')).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([deleteTransaction]);
            expect(trans.currentState().get(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                originalValue: originalValue,
                type: deleteTransaction.type
            });
            trans.reset();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());

            // DELETE -> Undo
            trans.add(deleteTransaction, originalValue);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());
            trans.reset();

            // DELETE -> Undo -> Redo
            trans.add(deleteTransaction, originalValue);
            trans.undo();
            trans.redo();
            expect(trans.getLastTransactionById('Key1')).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([deleteTransaction]);
            expect(trans.currentState().get(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                originalValue: originalValue,
                type: deleteTransaction.type
            });
            trans.reset();
        });

        it('Add UPDATE type change - all feasible paths', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            // UPDATE
            const originalValue = { key: 'Key1', value: 1 };
            const newValue = { key: 'Key1', value: 2 };
            const updateTransaction: ITransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };
            trans.add(updateTransaction, originalValue);
            expect(trans.getLastTransactionById('Key1')).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.currentState().get(updateTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                originalValue: originalValue,
                type: updateTransaction.type
            });
            trans.reset();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());

            // UPDATE -> Undo
            trans.add(updateTransaction, originalValue);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.currentState()).toEqual(new Map());
            trans.reset();

            // UPDATE -> Undo -> Redo
            trans.add(updateTransaction, originalValue);
            trans.undo();
            trans.redo();
            expect(trans.getLastTransactionById('Key1')).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.currentState().get(updateTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                originalValue: originalValue,
                type: updateTransaction.type
            });
            trans.reset();

            // UPDATE -> UPDATE
            trans.add(updateTransaction, originalValue);
            const newValue2 = { key: 'Key1', value: 2 };
            const updateTransaction2: ITransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue2 };
            trans.add(updateTransaction, originalValue);
            expect(trans.getLastTransactionById('Key1')).toEqual(updateTransaction2);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, updateTransaction]);
            expect(trans.currentState().get(updateTransaction.id)).toEqual({
                value: updateTransaction2.newValue,
                originalValue: originalValue,
                type: updateTransaction2.type
            });
            trans.reset();

            // UPDATE -> UPDATE -> Undo
            trans.add(updateTransaction, originalValue);
            trans.add(updateTransaction, originalValue);
            trans.undo();
            expect(trans.getLastTransactionById('Key1')).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.currentState().get(updateTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                originalValue: originalValue,
                type: updateTransaction.type
            });
            trans.reset();

            // UPDATE -> UPDATE -> Undo -> Redo
            trans.add(updateTransaction, originalValue);
            trans.add(updateTransaction, originalValue);
            trans.undo();
            trans.redo();
            expect(trans.getLastTransactionById('Key1')).toEqual(updateTransaction2);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, updateTransaction]);
            expect(trans.currentState().get(updateTransaction.id)).toEqual({
                value: updateTransaction2.newValue,
                originalValue: originalValue,
                type: updateTransaction2.type
            });
            trans.reset();

            // UPDATE -> DELETE
            trans.add(updateTransaction, originalValue);
            const deleteTransaction: ITransaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction);
            expect(trans.getLastTransactionById('Key1')).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, deleteTransaction]);
            expect(trans.currentState().get(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                originalValue: originalValue,
                type: deleteTransaction.type
            });
            trans.reset();

            // UPDATE -> DELETE -> Undo
            trans.add(updateTransaction, originalValue);
            trans.add(deleteTransaction);
            trans.undo();
            expect(trans.getLastTransactionById('Key1')).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.currentState().get(updateTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                originalValue: originalValue,
                type: updateTransaction.type
            });
            trans.reset();

            // UPDATE -> DELETE -> Undo -> Redo
            trans.add(updateTransaction, originalValue);
            trans.add(deleteTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getLastTransactionById('Key1')).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, deleteTransaction]);
            expect(trans.currentState().get(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                originalValue: originalValue,
                type: deleteTransaction.type
            });
            trans.reset();
        });

        it('Update data when data is list of objects', () => {
            const originalData = SampleTestData.generateProductData(50);
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            const item0Update1: ITransaction = { id: 1, type: TransactionType.UPDATE, newValue: { Category: 'Some new value' } };
            trans.add(item0Update1, originalData[1]);

            const item10Delete: ITransaction = { id: 10, type: TransactionType.DELETE, newValue: null };
            trans.add(item10Delete, originalData[10]);

            const newItem1: ITransaction = {
                id: 'add1', type: TransactionType.ADD, newValue: {
                    ID: undefined,
                    Category: 'Category Added',
                    Downloads: 100,
                    Items: 'Items Added',
                    ProductName: 'ProductName Added',
                    ReleaseDate: new Date(),
                    Released: true,
                    Test: 'test Added'
                }
            };

            trans.add(newItem1, undefined);

            trans.update(originalData);
            expect(originalData.find(i => i.ID === 1).Category).toBe('Some new value');
            expect(originalData.find(i => i.ID === 10)).toBeUndefined();
            expect(originalData.length).toBe(50);
            expect(originalData[49]).toEqual(newItem1.newValue);
        });

        it('Update data when data is list of primitives', () => {
            const originalData = SampleTestData.generateListOfPrimitiveValues(50, 'String');
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            const item0Update1: ITransaction = { id: 1, type: TransactionType.UPDATE, newValue: 'Updated Row' };
            trans.add(item0Update1, originalData[1]);

            const item10Delete: ITransaction = { id: 10, type: TransactionType.DELETE, newValue: null };
            trans.add(item10Delete, originalData[10]);

            const newItem1: ITransaction = {
                id: 'add1', type: TransactionType.ADD, newValue: 'Added Row'
            };

            trans.add(newItem1, undefined);

            trans.update(originalData);
            expect(originalData[1]).toBe('Updated Row');
            expect(originalData.find(i => i === 'Row 10')).toBeUndefined();
            expect(originalData.length).toBe(50);
            expect(originalData[49]).toEqual('Added Row');

        });
    });
});

