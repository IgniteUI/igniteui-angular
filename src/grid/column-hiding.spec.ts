
// import { AfterContentChecked, AfterViewChecked, AfterViewInit, ChangeDetectorRef,
//     Component, DebugElement, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
// import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
// import { By } from "@angular/platform-browser";
// import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
// import { Calendar } from "../calendar";
// import { IgxCheckboxComponent } from "../checkbox/checkbox.component";
// import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from "./column-hiding-item.component";
// import { IgxColumnHidingComponent, IgxColumnHidingModule } from "./column-hiding.component";
// import { IgxColumnComponent } from "./column.component";
// import { IgxGridComponent } from "./grid.component";
// import { IgxGridModule } from "./index";

// fdescribe("Column chooser", () => {
//     let fix;
//     let grid: IgxGridComponent;
//     let columnChooser: IgxColumnHidingComponent;
//     let columnChooserElement: DebugElement;
//     const componentTitle = "Column Hiding UI";
//     beforeEach(async(() => {
//         TestBed.configureTestingModule({
//             declarations: [
//                 GridWithColumnChooserComponent,
//                 GridWithoutColumnChooserComponent
//             ],
//             imports: [
//                 BrowserAnimationsModule,
//                 IgxGridModule.forRoot(),
//                 IgxColumnHidingModule
//             ]
//         })
//         .compileComponents();
//     }));

//     describe("", () => {
//         beforeEach(() => {
//             fix = TestBed.createComponent(GridWithColumnChooserComponent);
//             fix.detectChanges();
//             grid = fix.componentInstance.grid;
//             columnChooser = grid.columnHidingUI;
//             columnChooser.togglable = false;
//             fix.detectChanges();

//             grid.cdr.detectChanges();
//             columnChooserElement = fix.debugElement.query(By.css("igx-column-hiding"));
//         });

//         it ("title is 'Column Hiding UI' initially.", () => {
//             const title = (columnChooserElement.query(By.css("h4")).nativeElement as HTMLHeadingElement).textContent;
//             expect(title).toBe(componentTitle);
//         });

//         it ("title can be successfully changed.", () => {
//             columnChooser.title = "Show/Hide Columns";
//             fix.detectChanges();

//             const titleElement = (columnChooserElement.query(By.css("h4")).nativeElement as HTMLHeadingElement);
//             expect(titleElement.textContent).toBe("Show/Hide Columns");

//             columnChooser.title = undefined;
//             fix.detectChanges();

//             expect(titleElement.textContent).toBe("");

//             columnChooser.title = null;
//             fix.detectChanges();

//             expect(titleElement.textContent).toBe("");
//         });

//         it("lists all 5 grid columns.", () => {
//             const columnItems = columnChooser.columnItems;
//             expect(columnItems.length).toBe(5);

//             const itemElements = columnChooserElement.queryAll(By.css("igx-column-hiding-item"));
//             expect(itemElements.length).toBe(5);
//         });

//         it("shows 'ProductName' checkbox unchecked and disabled.", () => {
//             const colProductName = getColumnChooserItem("ProductName");
//             expect(colProductName).toBeDefined();
//             expect(colProductName.disableHiding).toBe(false);

//             const chkProductName = getCheckboxElement("ProductName");

//             expect(chkProductName).toBeDefined();
//             const chkInput = chkProductName.query(By.css("input")).nativeElement as HTMLInputElement;
//             expect(chkInput.type).toBe("checkbox");
//             expect(chkInput.disabled).toBe(true);
//             expect(chkInput.checked).toBe(false);
//         });

//         it("reflects changes in columns' disableHiding properly.", () => {
//             grid.columns[0].disableHiding = false;
//             fix.detectChanges();

//             const colProductName = getColumnChooserItem("ID");
//             expect(colProductName).toBeDefined();
//             expect(colProductName.disableHiding).toBe(false);

//             const checkbox = getCheckboxInput("ID");

//             expect(checkbox.disabled).toBe(true);
//             expect(checkbox.checked).toBe(false);

//             grid.columns[0].disableHiding = true;
//             fix.detectChanges();

//             expect(checkbox.disabled).toBe(false);
//             expect(checkbox.checked).toBe(false);
//         });

//         it("prevents hiding a column whose disableHiding=undefined.", () => {
//             grid.columns[3].disableHiding = undefined;
//             fix.detectChanges();

//             const checkbox = getCheckboxInput("Released");
//             expect(checkbox.disabled).toBe(true);
//             expect(checkbox.checked).toBe(false);
//         });

//         it("shows all items and buttons disabled when all columns' disableHiding is false.", () => {
//             grid.columns.forEach((col) => col.disableHiding = false);
//             fix.detectChanges();

//             const checkboxes = getCheckboxInputs();

//             expect(checkboxes.filter((chk) => chk.disabled).length).toBe(5);
//             expect(checkboxes.filter((chk) => chk.checked).length).toBe(1);
//             expect(getCheckboxInput("Downloads").checked).toBe(true);

//             expect(getButtonDisabledState("Show All")).toBe(true);
//             expect(getButtonDisabledState("Hide All")).toBe(true);
//         });

//         it("- toggling column's checkbox checked state successfully changes the grid column's visibility.", () => {
//             const checkbox = getCheckboxInput("ReleaseDate");
//             expect(checkbox.disabled).toBe(false);
//             expect(checkbox.checked).toBe(false);
//             const column = grid.getColumnByName("ReleaseDate");

//             expect(column.hidden).toBe(false);
//             expect(grid.visibleColumns.length).toBe(4);

//             checkbox.click();

//             expect(checkbox.checked).toBe(true);
//             expect(column.hidden).toBe(true);
//             expect(grid.visibleColumns.length).toBe(3);

//             checkbox.click();

//             expect(checkbox.checked).toBe(false);
//             expect(column.hidden).toBe(false);
//             expect(grid.visibleColumns.length).toBe(4);
//         });

//         it(" UI reflects properly grid column's hidden value changes.", () => {
//             const checkbox = getCheckboxInput("ReleaseDate");
//             expect(checkbox.disabled).toBe(false);
//             expect(checkbox.checked).toBe(false);
//             const column = grid.getColumnByName("ReleaseDate");

//             column.hidden = true;
//             fix.detectChanges();

//             expect(column.hidden).toBe(true);
//             expect(checkbox.checked).toBe(true);
//             expect(grid.visibleColumns.length).toBe(3);

//             column.hidden = false;
//             fix.detectChanges();

//             expect(checkbox.checked).toBe(false);
//             expect(column.hidden).toBe(false);
//             expect(grid.visibleColumns.length).toBe(4);

//             column.hidden = undefined;
//             fix.detectChanges();

//             expect(checkbox.checked).toBe(false);
//             expect(column.hidden).toBe(undefined);
//             expect(grid.visibleColumns.length).toBe(4);

//             column.hidden = null;
//             fix.detectChanges();

//             expect(checkbox.checked).toBe(false);
//             expect(column.hidden).toBe(null);
//             expect(grid.visibleColumns.length).toBe(4);
//         });

//         it("enables the column checkbox and 'Show All' button after changing disableHiding of a hidden column.", () => {
//             grid.columns.forEach((col) => col.disableHiding = false);
//             grid.getColumnByName("Downloads").disableHiding = true;
//             fix.detectChanges();

//             const checkbox = getCheckboxInput("Downloads");
//             expect(checkbox.disabled).toBe(false);
//             expect(checkbox.checked).toBe(true);

//             expect(getButtonDisabledState("Show All")).toBe(false);
//             expect(getButtonDisabledState("Hide All")).toBe(true);

//             checkbox.click();

//             expect(checkbox.checked).toBe(false, "Checkbox is not unchecked!");

//             expect(getButtonDisabledState("Show All")).toBe(true, "Show All button is not disabled!");
//             expect(getButtonDisabledState("Hide All")).toBe(false, "Hide All button is not enabled!");

//             checkbox.click();

//             expect(checkbox.checked).toBe(true, "Checkbox is not checked!");

//             expect(getButtonDisabledState("Show All")).toBe(false, "Show All button is not enabled!");
//             expect(getButtonDisabledState("Hide All")).toBe(true, "Hide All button is not disabled!");
//         });

//         it("enables the column checkbox and 'Hide All' button after changing disableHiding of a visible column.", () => {
//             grid.columns.forEach((col) => col.disableHiding = false);
//             grid.getColumnByName("Released").disableHiding = true;
//             fix.detectChanges();

//             const checkbox = getCheckboxInput("Released");
//             expect(checkbox.disabled).toBe(false);
//             expect(checkbox.checked).toBe(false);

//             expect(getButtonDisabledState("Show All")).toBe(true);
//             expect(getButtonDisabledState("Hide All")).toBe(false);

//             checkbox.click();

//             expect(checkbox.checked).toBe(true);

//             expect(getButtonDisabledState("Show All")).toBe(false);
//             expect(getButtonDisabledState("Hide All")).toBe(true);

//             checkbox.click();

//             expect(checkbox.checked).toBe(false);
//             expect(getButtonDisabledState("Show All")).toBe(true);
//             expect(getButtonDisabledState("Hide All")).toBe(false);
//         });

//         it("- 'Hide All' button gets enabled after checking a column when all used to be hidden.", () => {
//             getButtonElement("Hide All").click();
//             expect(getButtonDisabledState("Hide All")).toBe(true);

//             getCheckboxInput("ID").click();

//             expect(getButtonDisabledState("Hide All")).toBe(false);
//         });

//         it("- 'Show All' button gets enabled after unchecking a column when all used to be visible.", () => {
//             getButtonElement("Show All").click();

//             expect(getButtonDisabledState("Show All")).toBe(true);
//             getCheckboxInput("Released").click();

//             expect(getButtonDisabledState("Show All")).toBe(false);
//         });

//         it("- 'Hide All' button gets disabled after unchecking the last checked column.", () => {
//             expect(getButtonDisabledState("Hide All")).toBe(false);

//             getCheckboxInput("ReleaseDate").click();
//             getCheckboxInput("Released").click();
//             getCheckboxInput("ID").click();

//             expect(getButtonDisabledState("Hide All")).toBe(true);
//         });

//         it("- 'Show All' button gets disabled after checking the last unchecked column.", () => {
//             expect(getButtonDisabledState("Show All")).toBe(false);
//             getCheckboxInput("Downloads").click();

//             expect(getButtonDisabledState("Show All")).toBe(true);
//         });

//         it("reflects changes in columns' headers.", () => {
//             const column = grid.getColumnByName("ReleaseDate");
//             column.header = "Release Date";
//             fix.detectChanges();
//             columnChooser.cdr.detectChanges();

//             const item = getColumnChooserItemElement("Release Date");
//             expect(item).toBeDefined();
//         });

//         it("onColumnVisibilityChanged event is fired on toggling checkboxes.", () => {
//             let currentArgs: IColumnVisibilityChangedEventArgs;
//             let counter = 0;
//             columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
//                 counter++;
//                 currentArgs = args;
//             });

//             getCheckboxInput("ReleaseDate").click();

//             expect(counter).toBe(1);
//             expect(currentArgs.column.field).toBe("ReleaseDate");
//             expect(currentArgs.newValue).toBe(true);

//             getCheckboxInput("ReleaseDate").click();

//             expect(counter).toBe(2);
//             expect(currentArgs.column.field).toBe("ReleaseDate");
//             expect(currentArgs.newValue).toBe(false);

//             getCheckboxInput("Downloads").click();

//             expect(counter).toBe(3);
//             expect(currentArgs.column.field).toBe("Downloads");
//             expect(currentArgs.newValue).toBe(false);

//             getCheckboxInput("Downloads").click();

//             expect(counter).toBe(4);
//             expect(currentArgs.column.field).toBe("Downloads");
//             expect(currentArgs.newValue).toBe(true);

//             getCheckboxInput("ProductName").click();

//             expect(counter).toBe(4);
//         });

//         it("onColumnVisibilityChanged event is fired for each hidable & visible column on pressing 'Hide All' button.", () => {
//             const currentArgs: IColumnVisibilityChangedEventArgs[] = [];
//             let counter = 0;
//             columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
//                 counter++;
//                 currentArgs.push(args);
//             });

//             getButtonElement("Hide All").click();

//             expect(counter).toBe(3);

//             expect(currentArgs[0].column.field).toBe("ID");
//             expect(currentArgs[0].newValue).toBe(true);

//             expect(currentArgs[1].column.field).toBe("Released");
//             expect(currentArgs[1].newValue).toBe(true);

//             expect(currentArgs[2].column.field).toBe("ReleaseDate");
//             expect(currentArgs[2].newValue).toBe(true);
//         });

//         it("onColumnVisibilityChanged event is fired for each hidable & hidden column on pressing 'Show All' button.", () => {
//             grid.columns[3].hidden = true;
//             grid.columns[4].hidden = true;
//             fix.detectChanges();

//             const currentArgs: IColumnVisibilityChangedEventArgs[] = [];
//             let counter = 0;
//             columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
//                 counter++;
//                 currentArgs.push(args);
//             });

//             getButtonElement("Show All").click();

//             expect(counter).toBe(3);

//             expect(currentArgs[0].column.field).toBe("Downloads");
//             expect(currentArgs[0].newValue).toBe(false);

//             expect(currentArgs[1].column.field).toBe("Released");
//             expect(currentArgs[1].newValue).toBe(false);

//             expect(currentArgs[2].column.field).toBe("ReleaseDate");
//             expect(currentArgs[2].newValue).toBe(false);
//         });

//         it("shows a filter textbox with 'Filter columns list ...' prompt", () => {
//             const filterInput = getFilterInput();
//             expect(filterInput).toBeDefined();
//             expect(filterInput.placeholder).toBe("Filter columns list ...");
//             expect(filterInput.textContent).toBe("");
//         });

//         it("filter prompt can be changed.", () => {
//             columnChooser.filterColumnsPrompt = "Type to filter columns";
//             fix.detectChanges();

//             const filterInput = getFilterInput();
//             expect(filterInput.placeholder).toBe("Type to filter columns");
//             expect(filterInput.textContent).toBe("");

//             columnChooser.filterColumnsPrompt = null;
//             fix.detectChanges();

//             expect(filterInput.placeholder).toBe("");
//             expect(filterInput.textContent).toBe("");

//             columnChooser.filterColumnsPrompt = undefined;
//             fix.detectChanges();

//             expect(filterInput.placeholder).toBe("");

//             columnChooser.filterColumnsPrompt = "@\#&*";
//             fix.detectChanges();

//             expect(filterInput.placeholder).toBe("@\#&*");
//         });

//         it("filters columns on every keystroke in filter input.", (done) => {
//             const filterInput = getFilterInput();
//             sendInput(filterInput, "r", fix).then(() => {
//                 expect(columnChooser.columnItems.length).toBe(3);
//                 sendInput(filterInput, "re", fix).then(() => {
//                     expect(columnChooser.columnItems.length).toBe(2);
//                     sendInput(filterInput, "r", fix).then(() => {
//                         expect(columnChooser.columnItems.length).toBe(3);
//                         sendInput(filterInput, "", fix).then(() => {
//                             expect(columnChooser.columnItems.length).toBe(5);
//                             done();
//                         });
//                     });
//                 });
//             });
//         });

//         it("filters columns according to the specified filter criteria.", fakeAsync(() => {
//             columnChooser.filterCriteria = "d";
//             tick();
//             fix.detectChanges();

//             const filterInput = getFilterInput();
//             expect(filterInput.value).toBe("d");
//             expect(columnChooser.columnItems.length).toBe(5);

//             columnChooser.filterCriteria += "a";
//             tick();
//             fix.detectChanges();

//             expect(filterInput.value).toBe("da");
//             expect(columnChooser.columnItems.length).toBe(1);

//             columnChooser.filterCriteria = "";
//             columnChooser.filterCriteria = "el";
//             tick();
//             fix.detectChanges();

//             expect(filterInput.value).toBe("el");
//             expect(columnChooser.columnItems.length).toBe(2);

//             columnChooser.filterCriteria = "";
//             tick();
//             fix.detectChanges();

//             expect(filterInput.value).toBe("");
//             expect(columnChooser.columnItems.length).toBe(5);
//         }));

//         it("- Hide All button operates over the filtered in columns only", fakeAsync(() => {
//             grid.columns[1].disableHiding = true;
//             columnChooser.filterCriteria = "re";
//             tick();
//             fix.detectChanges();

//             const btnHideAll = getButtonElement("Hide All");
//             expect(getButtonDisabledState("Show All")).toBe(true);
//             expect(getButtonDisabledState("Hide All")).toBe(false);
//             expect(columnChooser.columnItems.length).toBe(2);

//             btnHideAll.click();

//             expect(getCheckboxInput("Released").checked).toBe(true);
//             expect(getCheckboxInput("ReleaseDate").checked).toBe(true);
//             expect(getButtonDisabledState("Hide All")).toBe(true);
//             expect(getButtonDisabledState("Show All")).toBe(false);

//             columnChooser.filterCriteria = "r";
//             tick();
//             fix.detectChanges();

//             expect(getButtonDisabledState("Show All")).toBe(false);
//             expect(getButtonDisabledState("Hide All")).toBe(false);

//             expect(getCheckboxInput("ProductName").checked).toBe(false);

//             btnHideAll.click();

//             columnChooser.filterCriteria = "";
//             tick();
//             fix.detectChanges();

//             expect(columnChooser.filterCriteria).toBe("");
//             expect(getCheckboxInput("ID").checked).toBe(false);
//             expect(getCheckboxInput("ProductName").checked).toBe(true);

//             expect(getButtonDisabledState("Show All")).toBe(false);
//             expect(getButtonDisabledState("Hide All")).toBe(false);
//         }));

//         it("- Show All button operates over the filtered in columns only", fakeAsync(() => {
//             grid.columns[1].disableHiding = true;
//             columnChooser.hideAllColumns();
//             columnChooser.filterCriteria = "re";
//             tick();
//             fix.detectChanges();

//             const btnShowAll = getButtonElement("Show All");
//             expect(getButtonDisabledState("Show All")).toBe(false);
//             expect(getButtonDisabledState("Hide All")).toBe(true);
//             expect(columnChooser.columnItems.length).toBe(2);

//             btnShowAll.click();

//             expect(getCheckboxInput("Released").checked).toBe(false);
//             expect(getCheckboxInput("ReleaseDate").checked).toBe(false);
//             expect(getButtonDisabledState("Hide All")).toBe(false);
//             expect(getButtonDisabledState("Show All")).toBe(true);

//             columnChooser.filterCriteria = "r";
//             tick();
//             fix.detectChanges();

//             expect(getButtonDisabledState("Show All")).toBe(false);
//             expect(getButtonDisabledState("Hide All")).toBe(false);

//             expect(getCheckboxInput("ProductName").checked).toBe(true);

//             btnShowAll.click();

//             columnChooser.filterCriteria = "";
//             tick(100);
//             fix.detectChanges();

//             expect(columnChooser.filterCriteria).toBe("");
//             expect(getCheckboxInput("ID").checked).toBe(true);
//             expect(getCheckboxInput("ProductName").checked).toBe(false);

//             expect(getButtonDisabledState("Show All")).toBe(false);
//             expect(getButtonDisabledState("Hide All")).toBe(false);
//         }));

//         it("hides the proper columns after filtering and clearing the filter", (done) => {
//             const filterInput = getFilterInput();

//             sendInput(filterInput, "a", fix).then(() => {
//                 fix.detectChanges();
//                 expect(getButtonDisabledState("Show All")).toBe(false);
//                 getButtonElement("Show All").click();

//                 expect(getButtonDisabledState("Show All")).toBe(true);
//                 expect(grid.columns[2].hidden).toBe(false);

//                 sendInput(filterInput, "", fix).then(() => {
//                     fix.detectChanges();
//                     expect(getButtonDisabledState("Show All")).toBe(true);
//                     expect(grid.columns[0].hidden).toBe(false);
//                     getCheckboxInput("ID").click();

//                     expect(getButtonDisabledState("Show All")).toBe(false);
//                     expect(grid.columns[0].hidden).toBe(true);
//                     done();
//                 });
//             });
//         });

//         it("fires onColumnVisibilityChanged event after filtering and clearing the filter.", (done) => {
//             let counter = 0;
//             let currentArgs: IColumnVisibilityChangedEventArgs;
//             columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
//                 counter++;
//                 currentArgs = args;
//             });

//             const filterInput = getFilterInput();

//             sendInput(filterInput, "a", fix).then(() => {
//                 fix.detectChanges();
//                 getCheckboxInput("Downloads").click();

//                 expect(counter).toBe(1);
//                 expect(currentArgs.column.field).toBe("Downloads");
//                 expect(grid.columns[2].hidden).toBe(false);

//                 sendInput(filterInput, "", fix).then(() => {
//                     fix.detectChanges();
//                     getCheckboxInput("ID").click();

//                     expect(grid.columns[0].hidden).toBe(true);
//                     expect(counter).toBe(2);
//                     expect(currentArgs.column.header).toBe("ID");
//                     done();
//                 });
//             });
//         });

//         it("button shows the number of hidden columns.", fakeAsync(() => {
//             grid.columnHidingUI.togglable = true;
//             tick(100);
//             fix.detectChanges();

//             const button = getColumnChooserButton();
//             expect(button.innerText.includes("1 HIDDEN COLUMN(S)")).toBe(true);
//             expect(getColumnChooserButtonIcon().innerText).toBe("VISIBILITY_OFF ");
//         }));

//         it("button shows the proper icon when no columns are hidden.", fakeAsync(() => {
//             grid.columnHidingUI.togglable = true;
//             grid.columns[2].hidden = false;
//             tick(100);
//             fix.detectChanges();

//             const button = getColumnChooserButton();
//             expect(button.innerText.includes("0 HIDDEN COLUMN(S)")).toBe(true);
//             expect(getColumnChooserButtonIcon().innerText).toBe("VISIBILITY ");
//         }));
//     });

//     describe("", () => {
//         beforeEach(() => {
//             fix = TestBed.createComponent(GridWithoutColumnChooserComponent);
//             fix.detectChanges();
//             grid = fix.componentInstance.grid;
//             fix.detectChanges();

//             grid.cdr.detectChanges();
//             columnChooserElement = fix.debugElement.query(By.css("igx-column-hiding"));
//         });

//         it("is not enabled by default.", () => {
//             columnChooser = grid.columnHidingUI;
//             expect(columnChooser).toBeUndefined();
//             expect(columnChooserElement).toBe(null);
//         });

//         it("button is shown when columnHiding is true and hidden - when false.", () => {
//             grid.columnHiding = true;
//             fix.detectChanges();

//             expect(grid.columnHidingUI).toBeDefined();
//             expect(columnChooserElement).toBeDefined();
//             expect(getColumnChooserButton()).not.toBe(null);

//             grid.columnHiding = false;
//             fix.detectChanges();

//             expect(grid.columnHidingUI).toBeUndefined();
//             expect(columnChooserElement).toBe(null);
//             expect(getColumnChooserButton()).toBe(null);

//             grid.columnHiding = undefined;
//             fix.detectChanges();

//             expect(grid.columnHidingUI).toBeUndefined();
//             expect(columnChooserElement).toBe(null);
//         });

//     });

//     function getColumnChooserButton() {
//         const button = fix.debugElement.queryAll(By.css("button")).find((b) => b.nativeElement.name === "btnColumnChooser");
//         return button ? button.nativeElement : undefined;
//     }

//     function getColumnChooserButtonIcon() {
//         const button = fix.debugElement.queryAll(By.css("button")).find((b) => b.nativeElement.name === "btnColumnChooser");
//         return button.query(By.css("igx-icon")).nativeElement;
//     }

//     function getColumnChooserItem(name: string): IgxColumnHidingItemComponent {
//         return columnChooser.columnItems.find((col) => col.name === name) as IgxColumnHidingItemComponent;
//     }

//     function getColumnChooserItemElement(name: string) {
//         const item = columnChooserElement.queryAll(By.css("igx-column-hiding-item"))
//                     .find((el) => el.nativeElement.outerText.includes(name));
//         return item;
//     }

//     function getCheckboxElement(name: string) {
//         if (!columnChooserElement) {
//             columnChooserElement = fix.debugElement.query(By.css("igx-column-hiding"));
//         }

//         const checkboxElements = columnChooserElement.queryAll(By.css("igx-checkbox"));
//         const chkProductName = checkboxElements.find((el) =>
//             (el.context as IgxCheckboxComponent).placeholderLabel.nativeElement.innerText === name);

//         return chkProductName;
//     }

//     function getCheckboxInputFromElement(checkboxEl: DebugElement): HTMLInputElement {
//         return checkboxEl.query(By.css("input")).nativeElement as HTMLInputElement;
//     }

//     function getCheckboxInput(name: string) {
//         const checkboxEl = getCheckboxElement(name);
//         const chkInput = checkboxEl.query(By.css("input")).nativeElement as HTMLInputElement;

//         return chkInput;
//     }

//     function getCheckboxInputs(): HTMLInputElement[] {
//         const checkboxElements = columnChooserElement.queryAll(By.css("igx-checkbox"));
//         const inputs = [];
//         checkboxElements.forEach((el) => {
//             inputs.push(el.query(By.css("input")).nativeElement as HTMLInputElement);
//         });

//         return inputs;
//     }

//     function getButtonElement(content: string): HTMLButtonElement {
//         const buttonElements = columnChooserElement.queryAll(By.css("button"));

//         const button = buttonElements.find((el) => (el.nativeElement as HTMLButtonElement).textContent === content);

//         return button.nativeElement as HTMLButtonElement;
//     }

//     function getButtonDisabledState(content: string) {
//         const button = getButtonElement(content);
//         return button.className.includes("igx-button--disabled");
//     }

//     function getFilterInput() {
//         const inputElement = columnChooserElement.queryAll(By.css("input"))
//                         .find((el) => (el.nativeElement as HTMLInputElement).type === "text");

//         return inputElement ? inputElement.nativeElement as HTMLInputElement : undefined;
//     }

//     function sendInput(element, text: string, fixture) {
//         element.value = text;
//         element.dispatchEvent(new Event("input"));
//         fixture.detectChanges();
//         return fixture.whenStable();
//     }
// });

// export class GridData {

//     public timeGenerator: Calendar = new Calendar();
//     public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

//     public data = [
//         {
//             Downloads: 254,
//             ID: 1,
//             ProductName: "Ignite UI for JavaScript",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 15),
//             Released: false
//         },
//         {
//             Downloads: 127,
//             ID: 2,
//             ProductName: "NetAdvantage",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
//             Released: true
//         },
//         {
//             Downloads: 20,
//             ID: 3,
//             ProductName: "Ignite UI for Angular",
//             ReleaseDate: null,
//             Released: null
//         },
//         {
//             Downloads: null,
//             ID: 4,
//             ProductName: null,
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", -1),
//             Released: true
//         },
//         {
//             Downloads: 100,
//             ID: 5,
//             ProductName: "",
//             ReleaseDate: undefined,
//             Released: ""
//         },
//         {
//             Downloads: 702,
//             ID: 6,
//             ProductName: "Some other item with Script",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 1),
//             Released: null
//         },
//         {
//             Downloads: 0,
//             ID: 7,
//             ProductName: null,
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "month", 1),
//             Released: true
//         },
//         {
//             Downloads: 1000,
//             ID: 8,
//             ProductName: null,
//             ReleaseDate: this.today,
//             Released: false
//         }
//     ];

// }

// @Component({
//     template: `<igx-grid [data]="data" width="500px" height="500px" [columnHiding]="true">
//         <igx-column [field]="'ID'" [header]="'ID'" [disableHiding]="false"></igx-column>
//         <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
//         <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
//         <igx-column [field]="'Released'" dataType="boolean"></igx-column>
//         <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
//     </igx-grid>`
// })
// export class GridWithColumnChooserComponent extends GridData {

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
//     @ViewChild("chooser") public chooser: IgxColumnHidingComponent;
// }

// @Component({
//     template: `<igx-grid [data]="data" width="500px" height="500px">
//         <igx-column [field]="'ID'" [header]="'ID'" [disableHiding]="false"></igx-column>
//         <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
//         <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
//         <igx-column [field]="'Released'" dataType="boolean"></igx-column>
//         <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
//     </igx-grid>`
// })
// export class GridWithoutColumnChooserComponent extends GridData {

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
// }
