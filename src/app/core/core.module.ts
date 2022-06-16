import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';
import { FontawesomeModule } from '../fontawesome.module';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgSelectFormFieldControlDirective } from './ng-select.directive';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    NgSelectModule,
    RouterModule,
    FontawesomeModule,
    AngularMaterialModule
  ],
  declarations: [
    NgSelectFormFieldControlDirective,
  ],
  exports: [
    NgSelectFormFieldControlDirective,
    TranslateModule
  ]
})
export class CoreModule {}
