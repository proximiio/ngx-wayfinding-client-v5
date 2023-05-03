import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FloorPickerComponent } from "./floor-picker/floor-picker.component";
import { ShopPickerComponent } from "./shop-picker/shop-picker.component";
import { AmenityPickerComponent } from "./amenity-picker/amenity-picker.component";
import { SearchComponent } from "./search/search.component";
import { DetailsComponent } from "./details/details.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule } from "@angular/forms";
import { AngularMaterialModule } from "../../angular-material.module";
import { SidebarComponent } from "./sidebar.component";
import { CoreModule } from "../core.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { OrdinalPipe } from "../ordinal.pipe";
import { MatExpansionModule } from "@angular/material/expansion";
import { ListViewComponent } from "./list-view/list-view.component";
import { RoutePickerComponent } from "./route-picker/route-picker.component";
import { ClosestAmenityComponent } from "./closest-amenity/closest-amenity.component";

@NgModule({
  imports: [
    CommonModule,
    NgSelectModule,
    AngularMaterialModule,
    FormsModule,
    FontAwesomeModule,
    CoreModule,
    MatExpansionModule,
  ],
  exports: [
    SidebarComponent,
    FloorPickerComponent,
    ShopPickerComponent,
    AmenityPickerComponent,
    SearchComponent,
    DetailsComponent,
    ListViewComponent,
    RoutePickerComponent,
    ClosestAmenityComponent,
  ],
  declarations: [
    SidebarComponent,
    FloorPickerComponent,
    ShopPickerComponent,
    AmenityPickerComponent,
    SearchComponent,
    DetailsComponent,
    ListViewComponent,
    RoutePickerComponent,
    ClosestAmenityComponent,
    OrdinalPipe,
  ],
})
export class SidebarModule {}
