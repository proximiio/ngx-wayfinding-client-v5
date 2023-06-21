import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { MapRoutingModule } from './map-routing.module';
import { CoreModule } from '../core/core.module';
import { FontawesomeModule } from '../fontawesome.module';
import { AngularMaterialModule } from '../angular-material.module';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        FontawesomeModule,
        MapRoutingModule,
        AngularMaterialModule
    ],
    exports: [
        MapComponent
    ],
    declarations: [
        MapComponent
    ]
})
export class MapModule {}
