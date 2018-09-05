import { IgxTransactionBaseService } from './transaction-base';
import { ITransaction, TransactionType } from './utilities';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { NoOpTransactionService } from './noop-transaction';

describe('IgxTransaction', () => {
    describe('IgxTransaction UNIT tests', () => {
        it('Should initialize tranaction log properly', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();
            expect(trans['_transactions']).toBeDefined();
            expect(trans['_transactions'].length).toEqual(0);
            expect(trans['_redoStack']).toBeDefined();
            expect(trans['_redoStack'].length).toEqual(0);
            expect(trans['_states']).toBeDefined();
            expect(trans['_states'].size).toEqual(0);
        });

        it('Should add changes to the tranaction log', () => {
            const trans = new IgxTransactionBaseService();
            const states: ITransaction[] = [
                { id: '1', type: TransactionType.ADD, newValue: 1 },
                { id: '2', type: TransactionType.ADD, newValue: 2 },
                { id: '3', type: TransactionType.ADD, newValue: 3 },
                { id: '1', type: TransactionType.UPDATE, newValue: 4 },
                { id: '5', type: TransactionType.ADD, newValue: 5 },
                { id: '6', type: TransactionType.ADD, newValue: 6 },
                { id: '2', type: TransactionType.DELETE, newValue: 7 },
                { id: '8', type: TransactionType.ADD, newValue: 8 },
                { id: '9', type: TransactionType.ADD, newValue: 9 },
                { id: '8', type: TransactionType.UPDATE, newValue: 10 }
            ];
            expect(trans['_transactions'].length).toEqual(0);
            expect(trans['_redoStack'].length).toEqual(0);
            let transactionIndex = 1;
            states.forEach(function (state) {
                trans.add(state);
                expect(trans.getLastTransactionById(state.id)).toEqual(state);
                expect(trans['_transactions'].length).toEqual(transactionIndex);
                expect(trans['_redoStack'].length).toEqual(0);
                transactionIndex++;
            });
        });

        it('Should throw an error when trying to add duplicate change', () => {
            const trans = new IgxTransactionBaseService();
            const states: ITransaction[] = [
                { id: '1', type: TransactionType.ADD, newValue: 1 },
                { id: '2', type: TransactionType.ADD, newValue: 2 },
                { id: '3', type: TransactionType.ADD, newValue: 3 },
                { id: '1', type: TransactionType.UPDATE, newValue: 4 },
                { id: '5', type: TransactionType.ADD, newValue: 5 },
                { id: '6', type: TransactionType.ADD, newValue: 6 },
                { id: '2', type: TransactionType.DELETE, newValue: 7 },
                { id: '8', type: TransactionType.ADD, newValue: 8 },
                { id: '9', type: TransactionType.ADD, newValue: 9 },
                { id: '8', type: TransactionType.UPDATE, newValue: 10 }
            ];
            states.forEach(function (state) {
                trans.add(state);
            });

            const change = { id: '6', type: TransactionType.ADD, newValue: 6 };
            expect(trans.getLastTransactionById('6')).toEqual(change);
            const msg = `Cannot add this change. Change with id: ${change.id} has been already added.`;
            expect(function () {
                trans.add(change);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to update change with no original value', () => {
            const trans = new IgxTransactionBaseService();
            const transactions: ITransaction[] = [
                { id: '1', type: TransactionType.ADD, newValue: 1 },
                { id: '2', type: TransactionType.ADD, newValue: 2 },
                { id: '3', type: TransactionType.ADD, newValue: 3 },
                { id: '1', type: TransactionType.UPDATE, newValue: 4 },
                { id: '5', type: TransactionType.ADD, newValue: 5 },
                { id: '6', type: TransactionType.ADD, newValue: 6 },
                { id: '2', type: TransactionType.DELETE, newValue: 7 },
                { id: '8', type: TransactionType.ADD, newValue: 8 },
                { id: '9', type: TransactionType.ADD, newValue: 9 },
                { id: '8', type: TransactionType.UPDATE, newValue: 10 }
            ];
            transactions.forEach(function (transaction) {
                trans.add(transaction);
            });

            const updateTransaction = { id: '2', type: TransactionType.DELETE, newValue: 7 };
            expect(trans.getLastTransactionById('2')).toEqual(updateTransaction);
            const msg = `Cannot add this change. This is first change of type ${updateTransaction.type} for id ${updateTransaction.id}.
                     For first change of this type original value is mandatory.`;
            expect(function () {
                updateTransaction.newValue = 107;
                trans.add(updateTransaction);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to delete an already deleted item', () => {
            const trans = new IgxTransactionBaseService();
            const originalValue = { key: 'Key1', value: 1 };
            const deleteTransaction: ITransaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, originalValue);
            expect(trans.getLastTransactionById('Key1')).toEqual(deleteTransaction);

            const msg = `Cannot add this change. Change with id: ${deleteTransaction.id} has been already deleted.`;
            expect(function () {
                trans.add(deleteTransaction);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to update an already deleted item', () => {
            const trans = new IgxTransactionBaseService();
            const originalValue = { key: 'Key1', value: 1 };
            const deleteTransaction: ITransaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, originalValue);
            expect(trans.getLastTransactionById('Key1')).toEqual(deleteTransaction);

            const msg = `Cannot add this change. Change with id: ${deleteTransaction.id} has been already deleted.`;
            expect(function () {
                deleteTransaction.type = TransactionType.UPDATE;
                deleteTransaction.newValue = 5;
                trans.add(deleteTransaction);
            }).toThrowError(msg);
        });

        it('Should get a transaction by transaction id', () => {
            const trans = new IgxTransactionBaseService();
            let state: ITransaction = { id: '1', type: TransactionType.ADD, newValue: 1 };
            trans.add(state);
            expect(trans.getLastTransactionById('1')).toEqual(state);
            state = { id: '2', type: TransactionType.ADD, newValue: 2 };
            trans.add(state);
            expect(trans.getLastTransactionById('2')).toEqual(state);
            state = { id: '3', type: TransactionType.ADD, newValue: 3 };
            trans.add(state);
            expect(trans.getLastTransactionById('3')).toEqual(state);
            state = { id: '1', type: TransactionType.UPDATE, newValue: 4 };
            trans.add(state);
            expect(trans.getLastTransactionById('1')).toEqual(state);
            state = { id: '5', type: TransactionType.ADD, newValue: 5 };
            trans.add(state);
            expect(trans.getLastTransactionById('5')).toEqual(state);
            state = { id: '6', type: TransactionType.ADD, newValue: 6 };
            trans.add(state);
            expect(trans.getLastTransactionById('6')).toEqual(state);
            state = { id: '2', type: TransactionType.DELETE, newValue: 7 };
            trans.add(state);
            expect(trans.getLastTransactionById('2')).toEqual(state);
            state = { id: '8', type: TransactionType.ADD, newValue: 8 };
            trans.add(state);
            expect(trans.getLastTransactionById('8')).toEqual(state);
            state = { id: '9', type: TransactionType.ADD, newValue: 9 };
            trans.add(state);
            expect(trans.getLastTransactionById('9')).toEqual(state);
            state = { id: '8', type: TransactionType.UPDATE, newValue: 10 };
            trans.add(state);
            expect(trans.getLastTransactionById('8')).toEqual(state);

            // Get unexisting change
            expect(trans.getLastTransactionById('100')).toEqual(undefined);
        });

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

