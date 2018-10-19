# igx-transaction

`TransactionService` allows the developers to plug a middleware between given component and its data source. While plugged in `TransactionService` should collect all the transactions performed in the component without send them to the data source. `TransactionService` should be able to update the data source and commit all the transactions when needed.
A walk through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/transaction.html)

## Usage

```typescript
@Component({
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionImplementation }]
})
```

## Getting Started

### Dependencies

To use the `TransactionService` import the TransactionService:

```typescript
import { TransactionService } from "igniteui-angular";
```
and then inject it in the component's constructor:

```typescript
    constructor(@Inject(IgxGridTransaction) private _transactions: TransactionService) { };
```

## API

### TransactionService

   | Name                  | Description                                                   | Parameters                |
   |-----------------------|---------------------------------------------------------------|---------------------------|
   |enabled                | Returns whether transaction is enabled for this service       | -                         |
   |add                    | Adds provided  transaction with recordRef if any              | transaction, recordRef?   |
   |getTransactionLog      | Returns an array of all transactions. If id is provided returns last transaction for provided id | id? |
   |undo                   | Remove the last transaction if any                            | -                         |
   |redo                   | Applies the last undone transaction if any                    | -                         |
   |aggregatedState        | Returns aggregated state of all transactions including pending ones| mergeChanges         |
   |getState               | Returns the state of the record with provided id              | id                        |
   |getAggregatedValue     | Returns value of the required id including all uncommitted changes| id, mergeChanges      |
   |commit                 | Applies all transactions over the provided data               | data                      |
   |clear                  | Clears all transactions                                       | -                         |
   |startPending           | Starts pending transactions. All transactions passed after call to startPending will not be added to transaction log | - |
   |endPending             | Clears all pending transactions and aggregated pending state. If commit is set to true commits pending states as single transaction | commit |
