import { IgxTransactionBaseService } from './transaction-base';
import { ITransaction, TransactionType } from './utilities';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

describe('IgxTransaction', () => {
    describe('IgxTransaction UNIT tests', () => {
        it('Should initialize transactions log properly', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();
            expect(trans['_transactions']).toBeDefined();
            expect(trans['_transactions'].length).toEqual(0);
            expect(trans['_redoStack']).toBeDefined();
            expect(trans['_redoStack'].length).toEqual(0);
            expect(trans['_states']).toBeDefined();
            expect(trans['_states'].size).toEqual(0);
        });

        it('Should add transactions to the transactions log', () => {
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
            expect(trans['_transactions'].length).toEqual(0);
            expect(trans['_redoStack'].length).toEqual(0);
            let transactionIndex = 1;
            transactions.forEach(function (transaction) {
                trans.add(transaction);
                expect(trans.getTransactionLog(transaction.id)).toEqual(transaction);
                expect(trans['_transactions'].length).toEqual(transactionIndex);
                expect(trans['_redoStack'].length).toEqual(0);
                transactionIndex++;
            });
        });

        it('Should throw an error when trying to add duplicate transaction', () => {
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
            transactions.forEach(function (t) {
                trans.add(t);
            });

            const transaction = { id: '6', type: TransactionType.ADD, newValue: 6 };
            expect(trans.getTransactionLog('6')).toEqual(transaction);
            const msg = `Cannot add this transaction. Transaction with id: ${transaction.id} has been already added.`;
            expect(function () {
                trans.add(transaction);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to update transaction with no recordRef', () => {
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
            expect(trans.getTransactionLog('2')).toEqual(updateTransaction);
            const msg = `Cannot add this transaction. This is first transaction of type ${updateTransaction.type} ` +
                `for id ${updateTransaction.id}. For first transaction of this type recordRef is mandatory.`;
            expect(function () {
                updateTransaction.newValue = 107;
                trans.add(updateTransaction);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to delete an already deleted item', () => {
            const trans = new IgxTransactionBaseService();
            const recordRef = { key: 'Key1', value: 1 };
            const deleteTransaction: ITransaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, recordRef);
            expect(trans.getTransactionLog('Key1')).toEqual(deleteTransaction);

            const msg = `Cannot add this transaction. Transaction with id: ${deleteTransaction.id} has been already deleted.`;
            expect(function () {
                trans.add(deleteTransaction);
            }).toThrowError(msg);
        });

        it('Should throw an error when trying to update an already deleted item', () => {
            const trans = new IgxTransactionBaseService();
            const recordRef = { key: 'Key1', value: 1 };
            const deleteTransaction: ITransaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, recordRef);
            expect(trans.getTransactionLog('Key1')).toEqual(deleteTransaction);

            const msg = `Cannot add this transaction. Transaction with id: ${deleteTransaction.id} has been already deleted.`;
            expect(function () {
                deleteTransaction.type = TransactionType.UPDATE;
                deleteTransaction.newValue = 5;
                trans.add(deleteTransaction);
            }).toThrowError(msg);
        });

        it('Should get a transaction by transaction id', () => {
            const trans = new IgxTransactionBaseService();
            let transaction: ITransaction = { id: '1', type: TransactionType.ADD, newValue: 1 };
            trans.add(transaction);
            expect(trans.getTransactionLog('1')).toEqual(transaction);
            transaction = { id: '2', type: TransactionType.ADD, newValue: 2 };
            trans.add(transaction);
            expect(trans.getTransactionLog('2')).toEqual(transaction);
            transaction = { id: '3', type: TransactionType.ADD, newValue: 3 };
            trans.add(transaction);
            expect(trans.getTransactionLog('3')).toEqual(transaction);
            transaction = { id: '1', type: TransactionType.UPDATE, newValue: 4 };
            trans.add(transaction);
            expect(trans.getTransactionLog('1')).toEqual(transaction);
            transaction = { id: '5', type: TransactionType.ADD, newValue: 5 };
            trans.add(transaction);
            expect(trans.getTransactionLog('5')).toEqual(transaction);
            transaction = { id: '6', type: TransactionType.ADD, newValue: 6 };
            trans.add(transaction);
            expect(trans.getTransactionLog('6')).toEqual(transaction);
            transaction = { id: '2', type: TransactionType.DELETE, newValue: 7 };
            trans.add(transaction);
            expect(trans.getTransactionLog('2')).toEqual(transaction);
            transaction = { id: '8', type: TransactionType.ADD, newValue: 8 };
            trans.add(transaction);
            expect(trans.getTransactionLog('8')).toEqual(transaction);
            transaction = { id: '9', type: TransactionType.ADD, newValue: 9 };
            trans.add(transaction);
            expect(trans.getTransactionLog('9')).toEqual(transaction);
            transaction = { id: '8', type: TransactionType.UPDATE, newValue: 10 };
            trans.add(transaction);
            expect(trans.getTransactionLog('8')).toEqual(transaction);

            // Get nonexisting transaction
            expect(trans.getTransactionLog('100')).toEqual(undefined);
        });

        it('Should add ADD type transaction - all feasible paths', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            // ADD
            const addTransaction: ITransaction = { id: '1', type: TransactionType.ADD, newValue: 1 };
            trans.add(addTransaction);
            expect(trans.getTransactionLog('1')).toEqual(addTransaction);
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.aggregatedState().get(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            trans.clear();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());

            // ADD -> Undo
            trans.add(addTransaction);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());
            trans.clear();

            // ADD -> Undo -> Redo
            trans.add(addTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.aggregatedState().get(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            trans.clear();

            // ADD -> DELETE
            trans.add(addTransaction);
            const deleteTransaction: ITransaction = { id: '1', type: TransactionType.DELETE, newValue: 1 };
            trans.add(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([addTransaction, deleteTransaction]);
            expect(trans.aggregatedState()).toEqual(new Map());
            trans.clear();

            // ADD -> DELETE -> Undo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.aggregatedState().get(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            trans.clear();

            // ADD -> DELETE -> Undo -> Redo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction, deleteTransaction]);
            expect(trans.aggregatedState()).toEqual(new Map());
            trans.clear();

            // ADD -> DELETE -> Undo -> Undo
            trans.add(addTransaction);
            trans.add(deleteTransaction);
            trans.undo();
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());
            trans.clear();

            // ADD -> UPDATE
            trans.add(addTransaction);
            const updateTransaction: ITransaction = { id: '1', type: TransactionType.UPDATE, newValue: 2 };
            trans.add(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([addTransaction, updateTransaction]);
            expect(trans.aggregatedState().get(addTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            trans.clear();

            // ADD -> UPDATE -> Undo
            trans.add(addTransaction);
            trans.add(updateTransaction);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([addTransaction]);
            expect(trans.aggregatedState().get(addTransaction.id)).toEqual({
                value: addTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            trans.clear();

            // ADD -> UPDATE -> Undo -> Redo
            trans.add(addTransaction);
            trans.add(updateTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog()).toEqual([addTransaction, updateTransaction]);
            expect(trans.aggregatedState().get(addTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                recordRef: undefined,
                type: addTransaction.type
            });
            trans.clear();
        });

        it('Should add DELETE type transaction - all feasible paths', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            // DELETE
            const recordRef = { key: 'Key1', value: 1 };
            const deleteTransaction: ITransaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction, recordRef);
            expect(trans.getTransactionLog('Key1')).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([deleteTransaction]);
            expect(trans.aggregatedState().get(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                recordRef: recordRef,
                type: deleteTransaction.type
            });
            trans.clear();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());

            // DELETE -> Undo
            trans.add(deleteTransaction, recordRef);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());
            trans.clear();

            // DELETE -> Undo -> Redo
            trans.add(deleteTransaction, recordRef);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog('Key1')).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([deleteTransaction]);
            expect(trans.aggregatedState().get(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                recordRef: recordRef,
                type: deleteTransaction.type
            });
            trans.clear();
        });

        it('Should add UPDATE type transaction - all feasible paths', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();

            // UPDATE
            const recordRef = { key: 'Key1', value: 1 };
            const newValue = { key: 'Key1', value: 2 };
            const updateTransaction: ITransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };
            trans.add(updateTransaction, recordRef);
            expect(trans.getTransactionLog('Key1')).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.aggregatedState().get(updateTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                recordRef: recordRef,
                type: updateTransaction.type
            });
            trans.clear();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());

            // UPDATE -> Undo
            trans.add(updateTransaction, recordRef);
            trans.undo();
            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());
            trans.clear();

            // UPDATE -> Undo -> Redo
            trans.add(updateTransaction, recordRef);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog('Key1')).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.aggregatedState().get(updateTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                recordRef: recordRef,
                type: updateTransaction.type
            });
            trans.clear();

            // UPDATE -> UPDATE
            trans.add(updateTransaction, recordRef);
            const newValue2 = { key: 'Key1', value: 2 };
            const updateTransaction2: ITransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue2 };
            trans.add(updateTransaction, recordRef);
            expect(trans.getTransactionLog('Key1')).toEqual(updateTransaction2);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, updateTransaction]);
            expect(trans.aggregatedState().get(updateTransaction.id)).toEqual({
                value: updateTransaction2.newValue,
                recordRef: recordRef,
                type: updateTransaction2.type
            });
            trans.clear();

            // UPDATE -> UPDATE -> Undo
            trans.add(updateTransaction, recordRef);
            trans.add(updateTransaction, recordRef);
            trans.undo();
            expect(trans.getTransactionLog('Key1')).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.aggregatedState().get(updateTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                recordRef: recordRef,
                type: updateTransaction.type
            });
            trans.clear();

            // UPDATE -> UPDATE -> Undo -> Redo
            trans.add(updateTransaction, recordRef);
            trans.add(updateTransaction, recordRef);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog('Key1')).toEqual(updateTransaction2);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, updateTransaction]);
            expect(trans.aggregatedState().get(updateTransaction.id)).toEqual({
                value: updateTransaction2.newValue,
                recordRef: recordRef,
                type: updateTransaction2.type
            });
            trans.clear();

            // UPDATE -> DELETE
            trans.add(updateTransaction, recordRef);
            const deleteTransaction: ITransaction = { id: 'Key1', type: TransactionType.DELETE, newValue: null };
            trans.add(deleteTransaction);
            expect(trans.getTransactionLog('Key1')).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, deleteTransaction]);
            expect(trans.aggregatedState().get(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                recordRef: recordRef,
                type: deleteTransaction.type
            });
            trans.clear();

            // UPDATE -> DELETE -> Undo
            trans.add(updateTransaction, recordRef);
            trans.add(deleteTransaction);
            trans.undo();
            expect(trans.getTransactionLog('Key1')).toEqual(updateTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction]);
            expect(trans.aggregatedState().get(updateTransaction.id)).toEqual({
                value: updateTransaction.newValue,
                recordRef: recordRef,
                type: updateTransaction.type
            });
            trans.clear();

            // UPDATE -> DELETE -> Undo -> Redo
            trans.add(updateTransaction, recordRef);
            trans.add(deleteTransaction);
            trans.undo();
            trans.redo();
            expect(trans.getTransactionLog('Key1')).toEqual(deleteTransaction);
            expect(trans.getTransactionLog()).toEqual([updateTransaction, deleteTransaction]);
            expect(trans.aggregatedState().get(deleteTransaction.id)).toEqual({
                value: deleteTransaction.newValue,
                recordRef: recordRef,
                type: deleteTransaction.type
            });
            trans.clear();
        });

        it('Should update data when data is list of objects', () => {
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

            trans.commit(originalData);
            expect(originalData.find(i => i.ID === 1).Category).toBe('Some new value');
            expect(originalData.find(i => i.ID === 10)).toBeUndefined();
            expect(originalData.length).toBe(50);
            expect(originalData[49]).toEqual(newItem1.newValue);
        });

        it('Should update data when data is list of primitives', () => {
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

            trans.commit(originalData);
            expect(originalData[1]).toBe('Updated Row');
            expect(originalData.find(i => i === 'Row 10')).toBeUndefined();
            expect(originalData.length).toBe(50);
            expect(originalData[49]).toEqual('Added Row');
        });

        it('Should add pending transaction and push it to transaction log', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();
            const recordRef = { key: 'Key1', value1: 1, value2: 2, value3: 3 };
            let newValue: any = { key: 'Key1', value1: 10 };
            let updateTransaction: ITransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };

            trans.startPending();
            trans.add(updateTransaction, recordRef);

            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());

            newValue = { key: 'Key1', value3: 30 };
            updateTransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };
            trans.add(updateTransaction, recordRef);

            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());

            trans.endPending(true);

            expect((<any>trans.getTransactionLog())).toEqual(
                [
                    {
                        id: 'Key1',
                        newValue: { key: 'Key1', value1: 10, value3: 30 },
                        type: 'update'
                    }
                ]);
            expect(trans.aggregatedState().get(updateTransaction.id)).toEqual({
                value: { key: 'Key1', value1: 10, value3: 30 },
                recordRef: recordRef,
                type: updateTransaction.type
            });
        });

        it('Should not add pending transaction and push it to transaction log', () => {
            const trans = new IgxTransactionBaseService();
            expect(trans).toBeDefined();
            const recordRef = { key: 'Key1', value1: 1, value2: 2, value3: 3 };
            let newValue: any = { key: 'Key1', value1: 10 };
            let updateTransaction: ITransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };

            trans.startPending();
            trans.add(updateTransaction, recordRef);

            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());

            newValue = { key: 'Key1', value3: 30 };
            updateTransaction = { id: 'Key1', type: TransactionType.UPDATE, newValue: newValue };
            trans.add(updateTransaction, recordRef);

            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());

            trans.endPending(false);

            expect(trans.getTransactionLog()).toEqual([]);
            expect(trans.aggregatedState()).toEqual(new Map());
        });
    });
});

