import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorPickerComponent } from './floor-picker/floor-picker.component';
import { ShopPickerComponent } from './shop-picker/shop-picker.component';
import { AmenityPickerComponent } from './amenity-picker/amenity-picker.component';
import { SearchComponent } from './search/search.component';
import { DetailsComponent } from './details/details.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../../angular-material.module';
import { SidebarComponent } from './sidebar.component';
import { CoreModule } from '../core.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrdinalPipe } from '../ordinal.pipe';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  imports: [
    CommonModule,
    NgSelectModule,
    AngularMaterialModule,
    FormsModule,
    FontAwesomeModule,
    CoreModule,
    MatExpansionModule
  ],
  exports: [
    SidebarComponent,
    FloorPickerComponent,
    ShopPickerComponent,
    AmenityPickerComponent,
    SearchComponent,
    DetailsComponent
  ],
  declarations: [
    SidebarComponent,
    FloorPickerComponent,
    ShopPickerComponent,
    AmenityPickerComponent,
    SearchComponent,
    DetailsComponent,
    OrdinalPipe
  ]
})
export class SidebarModule {}
