import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapModule } from './map/map.module';
import { CoreModule } from './core/core.module';
import { AngularMaterialModule } from './angular-material.module';
import { FontawesomeModule } from './fontawesome.module';
import { environment } from '../environments/environment';
import { SidebarModule } from './core/sidebar/sidebar.module';
import { SettingsDialogComponent } from './core/settings-dialog/settings-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';

const APP_PREFIX = environment.appPrefix;

@NgModule({
  declarations: [
    AppComponent,
    SettingsDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FontawesomeModule,
    AngularMaterialModule,
    CoreModule,
    SidebarModule,
    MapModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [SettingsDialogComponent]
})
export class AppModule { }
