import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { AngularMaterialModule } from "../angular-material.module";
import { FontawesomeModule } from "../fontawesome.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgSelectFormFieldControlDirective } from "./ng-select.directive";
import { TranslateModule } from "@ngx-translate/core";
import { QRCodeModule } from "angularx-qrcode";

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    RouterModule,
    FontawesomeModule,
    AngularMaterialModule,
    QRCodeModule,
  ],
  declarations: [NgSelectFormFieldControlDirective],
  exports: [
    NgSelectFormFieldControlDirective,
    TranslateModule,
    ReactiveFormsModule,
    QRCodeModule,
  ],
})
export class CoreModule {}
