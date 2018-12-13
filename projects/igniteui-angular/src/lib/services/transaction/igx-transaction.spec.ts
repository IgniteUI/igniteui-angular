import { IgxTransactionService } from './igx-transaction';
import { Transaction, TransactionType, HierarchicalTransaction } from './transaction';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxHierarchicalTransactionService } from './igx-hierarchical-transaction';

describe('IgxTransaction', () => {
    describe('IgxTransaction UNIT tests', () => {
        it('Should initialize transactions log properly', () => {
            const trans = new IgxTransactionService();
            expect(trans).toBeDefined();
            expect(trans['_transactions']).toBeDefined();
            expect(trans['_transactions'].length).toEqual(0);
            expect(trans['_redoStack']).toBeDefined();
            expect(trans['_redoStack'].length).toEqual(0);
            expect(trans['_states']).toBeDefined();
            expect(trans['_states'].size).toEqual(0);
        });

        it('Should add transactions to the transactions log', () => {
            const trans = new IgxTransactionService();
            const transactions: Transaction[] = [
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
            transactions.forEach(function (transaction) {
                trans.add(transaction);
                expect(trans.getTransactionLog(transaction.id).pop()).toEqual(transaction);
                expect(trans['_transactions'].length).toEqual(transactionIndex);
                expect(trans['_redoStack'].length).toEqual(0);
                transactionIndex++;
            });
        });

        it('Should throw an error when trying to add duplicate transaction', () => {
            const trans = new IgxTransactionService();
            const transactions: Transaction[] = [
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
            transactions.forEach(function (t) {
                trans.add(t);
            });

            const transaction = { id: '6', type: TransactionType.ADD, newValue: 6 };
            expect(trans.getTransactionLog('6').pop()).toEqual(transaction);
            const msg = `Cannot add this transaction. Transaction with id: ${transaction.id} has been already added.`;
            expect(function () {
                trans.add(transaction);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to update transaction with no recordRef', () => {
            const trans = new IgxTransactionService();
            const transactions: Transaction[] = [
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
            expect(trans.getTransactionLog('2').pop()).toEqual(updateTransaction);
            const msg = `Cannot add this transaction. This is first transaction of type ${updateTransaction.type} ` +
                `for id ${updateTransaction.id}. For first transaction of this type recordRef is mandatory.`;
            expect(function () {
                updateTransaction.newValue = 107;
                trans.add(updateTransaction);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to delete an already deleted item', () => {
            const trans = new IgxTransactionService();
            const recordRef = { key: 'Key1', value: 1 };
            const deleteTransaction: Transaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, recordRef);
            expect(trans.getTransactionLog('Key1').pop()).toEqual(deleteTransaction);

            const msg = `Cannot add this transaction. Transaction with id: ${deleteTransaction.id} has been already deleted.`;
            expect(function () {
                trans.add(deleteTransaction);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to update an already deleted item', () => {
            const trans = new IgxTransactionService();
            const recordRef = { key: 'Key1', value: 1 };
            const deleteTransaction: Transaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, recordRef);
            expect(trans.getTransactionLog('Key1').pop()).toEqual(deleteTransaction);

            const msg = `Cannot add this transaction. Transaction with id: ${deleteTransaction.id} has been already deleted.`;
            expect(function () {
                deleteTransaction.type = TransactionType.UPDATE;
                deleteTransaction.newValue = 5;
                trans.add(deleteTransaction);
            }).toThrowError(msg);
        });

        it('Should get a transaction by transaction id', () => {
            const trans = new IgxTransactionService();
            let transaction: Transaction = { id: '1', type: TransactionType.ADD, newValue: 1 };
            trans.add(transaction);
            expect(trans.getTransactionLog('1').pop()).toEqual(transaction);
            transaction = { id: '2', type: TransactionType.ADD, newValue: 2 };
            trans.add(transaction);
            expect(trans.getTransactionLog('2').pop()).toEqual(transaction);
            transaction = { id: '3', type: TransactionType.ADD, newValue: 3 };
            trans.add(transaction);
            expect(trans.getTransactionLog('3').pop()).toEqual(transaction);
            transaction = { id: '1', type: TransactionType.UPDATE, newValue: 4 };
            trans.add(transaction);
            expect(trans.getTransactionLog('1').pop()).toEqual(transaction);
            transaction = { id: '5', type: TransactionType.ADD, newValue: 5 };
            trans.add(transaction);
            expect(trans.getTransactionLog('5').pop()).toEqual(transaction);
            transaction = { id: '6', type: TransactionType.ADD, newValue: 6 };
            trans.add(transaction);
            expect(trans.getTransactionLog('6').pop()).toEqual(transaction);
            transaction = { id: '2', type: TransactionType.DELETE, newValue: 7 };
            trans.add(transaction);
            expect(trans.getTransactionLog('2').pop()).toEqual(transaction);
            transaction = { id: '8', type: TransactionType.ADD, newValue: 8 };
            trans.add(transaction);
            expect(trans.getTransactionLog('8').pop()).toEqual(transaction);
            transaction = { id: '9', type: TransactionType.ADD, newValue: 9 };
            trans.add(transaction);
            expect(trans.getTransactionLog('9').pop()).toEqual(transaction);
            transaction = { id: '8', type: TransactionType.UPDATE, newValue: 10 };
            trans.add(transaction);
            expect(trans.getTransactionLog('8').pop()).toEqual(transaction);

            // Get nonexisting transaction
            expect(trans.getTransactionLog('100').pop()).toEqual(undefined);
        });

        it('Should add ADD type transaction - all feasible paths, and correctly fires onStateUpdate', () => {
            const trans = new IgxTransactionService();
            spyOn(trans.onStateUpdate, 'emit').and.callThrough();
            expect(trans).toBeDefined();

            // ADD
            const addTransaction: Transaction = { id: '1', type: TransactionType.ADD, newValue: 1 };
            trans.add(addTransaction);
            expect(trans.getAggregatedValue('1', true)).toEqual(1);
            expect(trans.getTransactionLog('1').pop()).toEqual(addTransaction);
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.getState(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(1);

            trans.clear();
            expect(trans.getState('1')).toBeUndefined();
            expect(trans.getAggregatedValue('1', true)).toBeNull();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(2);

            // ADD -> Undo
            trans.add(addTransaction);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(4);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(5);

            // ADD -> Undo -> Redo
            trans.add(addTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.getState(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(8);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(9);

            // ADD -> DELETE
            trans.add(addTransaction);
            const deleteTransaction: Transaction = { id: '1', type: TransactionType.DELETE, newValue: 1 };
            trans.add(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([addTransaction, deleteTransaction]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(11);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(12);

            // ADD -> DELETE -> Undo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.getState(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(15);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(16);

            // ADD -> DELETE -> Undo -> Redo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction, deleteTransaction]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(20);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(21);

            // ADD -> DELETE -> Undo -> Undo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(25);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(26);

            // ADD -> UPDATE
            trans.add(addTransaction);
            const updateTransaction: Transaction = { id: '1', type: TransactionType.UPDATE, newValue: 2 };
            trans.add(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([addTransaction, updateTransaction]);
            expect(trans.getState(addTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(28);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(29);

            // ADD -> UPDATE -> Undo
            trans.add(addTransaction);
            trans.add(updateTransaction);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.getState(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(32);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(33);

            // ADD -> UPDATE -> Undo -> Redo
            trans.add(addTransaction);
            trans.add(updateTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction, updateTransaction]);
            expect(trans.getState(addTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(37);

            trans.clear();
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(38);
        });

        it('Should add DELETE type transaction - all feasible paths', () => {
            const trans = new IgxTransactionService();
            expect(trans).toBeDefined();

            // DELETE
            const recordRef = { key: 'Key1', value: 1 };
            const deleteTransaction: Transaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, recordRef);
            expect(trans.getTransactionLog('Key1').pop()).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([deleteTransaction]);
            expect(trans.getState(deleteTransaction.id)).toEqual({
                value: null,
                recordRef: recordRef,
                type: deleteTransaction.type
            });
            trans.clear();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);

            // DELETE -> Undo
            trans.add(deleteTransaction, recordRef);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);
            trans.clear();

            // DELETE -> Undo -> Redo
            trans.add(deleteTransaction, recordRef);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog('Key1').pop()).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([deleteTransaction]);
            expect(trans.getState(deleteTransaction.id)).toEqual({
                value: null,
                recordRef: recordRef,
                type: deleteTransaction.type
            });
            trans.clear();
        });

        it('Should add UPDATE type transaction - all feasible paths', () => {
            const trans = new IgxTransactionService();
            expect(trans).toBeDefined();

            // UPDATE
            const recordRef = { key: 'Key1', value: 1 };
            const newValue = { key: 'Key1', value: 2 };
            const updateTransaction: Transaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };
            trans.add(updateTransaction, recordRef);
            expect(trans.getState('Key1')).toBeTruthy();
            expect(trans.getAggregatedValue('Key1', true)).toEqual(newValue);
            expect(trans.getTransactionLog('Key1').pop()).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.getState(updateTransaction.id)).toEqual({
                value: { value: 2 },
                recordRef: recordRef,
                type: updateTransaction.type
            });
            trans.clear();
            expect(trans.getState('Key1')).toBeFalsy();
            expect(trans.getAggregatedValue('Key1', true)).toBeNull();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);

            // UPDATE -> Undo
            trans.add(updateTransaction, recordRef);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);
            trans.clear();

            // UPDATE -> Undo -> Redo
            trans.add(updateTransaction, recordRef);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog('Key1').pop()).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.getState(updateTransaction.id)).toEqual({
                value: { value: 2 },
                recordRef: recordRef,
                type: updateTransaction.type
            });
            trans.clear();

            // UPDATE -> UPDATE
            trans.add(updateTransaction, recordRef);
            const newValue2 = { key: 'Key1', value: 3 };
            const updateTransaction2: Transaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue2 };
            trans.add(updateTransaction2, recordRef);
            expect(trans.getTransactionLog('Key1').pop()).toEqual(updateTransaction2);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, updateTransaction2]);
            expect(trans.getState(updateTransaction.id)).toEqual({
                value: { value: 3 },
                recordRef: recordRef,
                type: updateTransaction2.type
            });
            trans.clear();

            // UPDATE -> UPDATE (to initial recordRef)
            trans.add(updateTransaction, recordRef);
            const asRecordRefTransaction: Transaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: recordRef };
            trans.add(asRecordRefTransaction, recordRef);
            expect(trans.getTransactionLog('Key1').pop()).toEqual(asRecordRefTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, asRecordRefTransaction]);
            expect(trans.getState(updateTransaction.id)).toBeUndefined();
            expect(trans.getAggregatedChanges(false)).toEqual([]);
            trans.clear();

            // UPDATE -> UPDATE -> Undo
            trans.add(updateTransaction, recordRef);
            trans.add(updateTransaction2, recordRef);
            trans.undo();
            expect(trans.getTransactionLog('Key1').pop()).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.getState(updateTransaction.id)).toEqual({
                value: { value: 2 },
                recordRef: recordRef,
                type: updateTransaction.type
            });
            trans.clear();

            // UPDATE -> UPDATE -> Undo -> Redo
            trans.add(updateTransaction, recordRef);
            trans.add(updateTransaction2, recordRef);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog('Key1').pop()).toEqual(updateTransaction2);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, updateTransaction2]);
            expect(trans.getState(updateTransaction.id)).toEqual({
                value: { value: 3 },
                recordRef: recordRef,
                type: updateTransaction2.type
            });
            trans.clear();

            // UPDATE -> DELETE
            trans.add(updateTransaction, recordRef);
            const deleteTransaction: Transaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction);
            expect(trans.getTransactionLog('Key1').pop()).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, deleteTransaction]);
            expect(trans.getState(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                recordRef: recordRef,
                type: deleteTransaction.type
            });
            trans.clear();

            // UPDATE -> DELETE -> Undo
            trans.add(updateTransaction, recordRef);
            trans.add(deleteTransaction);
            trans.undo();
            expect(trans.getTransactionLog('Key1').pop()).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.getState(updateTransaction.id)).toEqual({
                value: { value: 2 },
                recordRef: recordRef,
                type: updateTransaction.type
            });
            trans.clear();

            // UPDATE -> DELETE -> Undo -> Redo
            trans.add(updateTransaction, recordRef);
            trans.add(deleteTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog('Key1').pop()).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, deleteTransaction]);
            expect(trans.getState(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                recordRef: recordRef,
                type: deleteTransaction.type
            });
            trans.clear();
        });

        it('Should properly confirm the length of the undo/redo stacks', () => {
            const originalData = SampleTestData.generateProductData(11);
            const transaction = new IgxTransactionService();
            expect(transaction).toBeDefined();

            // Stacks are clear by default
            expect(transaction.canRedo).toBeFalsy();
            expect(transaction.canUndo).toBeFalsy();
            let addItem: Transaction = { id: 1, type: TransactionType.ADD, newValue: { Category: 'Something' } };
            transaction.add(addItem);
            expect(transaction.canRedo).toBeFalsy();
            expect(transaction.canUndo).toBeTruthy();
            addItem = { id: 2, type: TransactionType.ADD, newValue: { Category: 'Something 2' } };
            transaction.add(addItem);
            expect(transaction.canRedo).toBeFalsy();
            expect(transaction.canUndo).toBeTruthy();
            transaction.undo();
            expect(transaction.canRedo).toBeTruthy();
            expect(transaction.canUndo).toBeTruthy();
            transaction.undo();
            expect(transaction.canRedo).toBeTruthy();
            expect(transaction.canUndo).toBeFalsy();
            transaction.redo();
            expect(transaction.canRedo).toBeTruthy();
            expect(transaction.canUndo).toBeTruthy();
            transaction.redo();
            expect(transaction.canRedo).toBeFalsy();
            expect(transaction.canUndo).toBeTruthy();
        });

        it('Should update data when data is list of objects', () => {
            const originalData = SampleTestData.generateProductData(50);
            const trans = new IgxTransactionService();
            expect(trans).toBeDefined();

            const item0Update1: Transaction = { id: 1, type: TransactionType.UPDATE, newValue: { Category: 'Some new value' } };
            trans.add(item0Update1, originalData[1]);

            const item10Delete: Transaction = { id: 10, type: TransactionType.DELETE, newValue: null };
            trans.add(item10Delete, originalData[10]);

            const newItem1: Transaction = {
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

            trans.commit(originalData);
            expect(originalData.find(i => i.ID === 1).Category).toBe('Some new value');
            expect(originalData.find(i => i.ID === 10)).toBeUndefined();
            expect(originalData.length).toBe(50);
            expect(originalData[49]).toEqual(newItem1.newValue);
        });

        it('Should update data when data is list of primitives', () => {
            const originalData = SampleTestData.generateListOfPrimitiveValues(50, 'String');
            const trans = new IgxTransactionService();
            expect(trans).toBeDefined();

            const item0Update1: Transaction = { id: 1, type: TransactionType.UPDATE, newValue: 'Updated Row' };
            trans.add(item0Update1, originalData[1]);

            const item10Delete: Transaction = { id: 10, type: TransactionType.DELETE, newValue: null };
            trans.add(item10Delete, originalData[10]);

            const newItem1: Transaction = {
                id: 'add1', type: TransactionType.ADD, newValue: 'Added Row'
            };

            trans.add(newItem1, undefined);

            trans.commit(originalData);
            expect(originalData[1]).toBe('Updated Row');
            expect(originalData.find(i => i === 'Row 10')).toBeUndefined();
            expect(originalData.length).toBe(50);
            expect(originalData[49]).toEqual('Added Row');
        });

        it('Should add pending transaction and push it to transaction log, and correctly fires onStateUpdate', () => {
            const trans = new IgxTransactionService();
            spyOn(trans.onStateUpdate, 'emit').and.callThrough();

            expect(trans).toBeDefined();
            const recordRef = { key: 'Key1', value1: 1, value2: 2, value3: 3 };
            let newValue: any = { key: 'Key1', value1: 10 };
            let updateTransaction: Transaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };

            trans.startPending();
            trans.add(updateTransaction, recordRef);

            expect(trans.getState('Key1')).toBeUndefined();
            expect(trans.getAggregatedValue('Key1', true)).toEqual({ key: 'Key1', value1: 10, value2: 2, value3: 3 });
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);

            newValue = { key: 'Key1', value3: 30 };
            updateTransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };
            trans.add(updateTransaction, recordRef);

            expect(trans.getState('Key1')).toBeUndefined();
            expect(trans.getAggregatedValue('Key1', true)).toEqual({ key: 'Key1', value1: 10, value2: 2, value3: 30 });
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);

            trans.endPending(true);

            expect(trans.getState('Key1')).toBeTruthy();
            expect(trans.getAggregatedValue('Key1', true)).toEqual({ key: 'Key1', value1: 10, value2: 2, value3: 30 });
            expect((<any>trans.getTransactionLog())).toEqual(
                [
                    {
                        id: 'Key1',
                        newValue: { key: 'Key1', value1: 10 },
                        type: 'update'
                    }, {
                        id: 'Key1',
                        newValue: { key: 'Key1', value3: 30 },
                        type: 'update'
                    }
                ]);
            expect(trans.getState(updateTransaction.id)).toEqual({
                value: { value1: 10, value3: 30 },
                recordRef: recordRef,
                type: updateTransaction.type
            });
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(1);
        });

        it('Should not add pending transaction and push it to transaction log, and correctly fires onStateUpdate', () => {
            const trans = new IgxTransactionService();
            spyOn(trans.onStateUpdate, 'emit').and.callThrough();

            expect(trans).toBeDefined();
            const recordRef = { key: 'Key1', value1: 1, value2: 2, value3: 3 };
            let newValue: any = { key: 'Key1', value1: 10 };
            let updateTransaction: Transaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };

            trans.startPending();
            trans.add(updateTransaction, recordRef);

            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);

            newValue = { key: 'Key1', value3: 30 };
            updateTransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };
            trans.add(updateTransaction, recordRef);

            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);

            trans.endPending(false);

            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.getAggregatedChanges(true)).toEqual([]);
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(0);
        });
    });

    describe('IgxHierarchicalTransaction UNIT Test', () => {
        it('Should set path for each state when transaction is added in Hierarchical data source', () => {
            const transaction = new IgxHierarchicalTransactionService();
            expect(transaction).toBeDefined();

            const path: any[] = ['P1', 'P2'];
            const addTransaction: HierarchicalTransaction = { id: 1, type: TransactionType.ADD, newValue: 'Add row', path };
            transaction.add(addTransaction);
            expect(transaction.getState(1).path).toBeDefined();
            expect(transaction.getState(1).path.length).toBe(2);
            expect(transaction.getState(1).path).toEqual(path);

            path.push('P3');
            const updateTransaction: HierarchicalTransaction = { id: 1, type: TransactionType.UPDATE, newValue: 'Updated row', path };
            transaction.add(updateTransaction, 'Update row');
            expect(transaction.getState(1).path.length).toBe(3);
            expect(transaction.getState(1).path).toEqual(path);
        });

        it('Should remove added transaction from states when deleted in Hierarchical data source', () => {
            const transaction = new IgxHierarchicalTransactionService();
            expect(transaction).toBeDefined();

            const path: any[] = [];
            let addTransaction: HierarchicalTransaction = { id: 1, type: TransactionType.ADD, newValue: 'Parent row', path };
            transaction.add(addTransaction);
            expect(transaction.getState(1).path).toBeDefined();
            expect(transaction.getState(1).path.length).toBe(0);
            expect(transaction.getState(1).path).toEqual(path);

            path.push(addTransaction.id);
            addTransaction = { id: 2, type: TransactionType.ADD, newValue: 'Child row', path };
            transaction.add(addTransaction);
            expect(transaction.getState(2).path).toBeDefined();
            expect(transaction.getState(2).path.length).toBe(1);
            expect(transaction.getState(2).path).toEqual(path);

            const deleteTransaction: HierarchicalTransaction = { id: 1, type: TransactionType.DELETE, newValue: null, path: [] };
            transaction.add(deleteTransaction);
            expect(transaction.getState(1)).toBeUndefined();
            expect(transaction.getState(2)).toBeUndefined();
        });

        it('Should mark update transactions state as deleted type when deleted in Hierarchical data source', () => {
            const transaction = new IgxHierarchicalTransactionService();
            expect(transaction).toBeDefined();

            const path: any[] = [];
            let updateTransaction: HierarchicalTransaction = { id: 1, type: TransactionType.UPDATE, newValue: 'Parent row', path };
            transaction.add(updateTransaction, 'Original value');
            expect(transaction.getState(1).path).toBeDefined();
            expect(transaction.getState(1).path.length).toBe(0);
            expect(transaction.getState(1).path).toEqual(path);

            path.push(updateTransaction.id);
            updateTransaction = { id: 2, type: TransactionType.UPDATE, newValue: 'Child row', path };
            transaction.add(updateTransaction, 'Original Value');
            expect(transaction.getState(2).path).toBeDefined();
            expect(transaction.getState(2).path.length).toBe(1);
            expect(transaction.getState(2).path).toEqual(path);

            const deleteTransaction: HierarchicalTransaction = { id: 1, type: TransactionType.DELETE, newValue: null, path: [] };
            transaction.add(deleteTransaction);
            expect(transaction.getState(1)).toBeDefined();
            expect(transaction.getState(1).type).toBe(TransactionType.DELETE);
            expect(transaction.getState(2)).toBeDefined();
            expect(transaction.getState(2).type).toBe(TransactionType.DELETE);
        });

        it('Should correctly call getAggregatedChanges without commit when recordRef is null', () => {
            const transaction = new IgxHierarchicalTransactionService();
            expect(transaction).toBeDefined();

            const deleteTransaction: HierarchicalTransaction = { id: 0, type: TransactionType.DELETE, newValue: null, path: [] };
            transaction.add(deleteTransaction, 'Deleted row');

            expect(transaction.getAggregatedChanges(false)).toEqual([deleteTransaction]);
        });
    });
});

