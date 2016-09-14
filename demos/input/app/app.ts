import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { IgInputModule } from "../../../src/main";

@NgModule({
    imports: [BrowserModule, FormsModule, IgInputModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule {}