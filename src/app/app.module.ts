import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapModule } from './map/map.module';
import { AuthGuard } from './auth/auth.guard';
import { AuthInterceptor } from './auth/auth.interceptor';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { AngularMaterialModule } from './angular-material.module';
import { FontawesomeModule } from './fontawesome.module';
import { DEFAULT_CONFIG, NgForageOptions, NgForageConfig, Driver } from 'ngforage';
import { environment } from '../environments/environment';
import { NotificationDialogComponent } from './core/notification-dialog/notification-dialog.component';

const APP_PREFIX = environment.appPrefix;

@NgModule({
  declarations: [
    AppComponent,
    NotificationDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FontawesomeModule,
    AngularMaterialModule,
    CoreModule,
    AuthModule,
    MapModule,
    AppRoutingModule
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: DEFAULT_CONFIG,
      useValue: {
        name: APP_PREFIX,
        driver: [ // defaults to indexedDB -> webSQL -> localStorage
          Driver.INDEXED_DB,
          Driver.LOCAL_STORAGE
        ]
      } as NgForageOptions
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [NotificationDialogComponent]
})
export class AppModule { }
