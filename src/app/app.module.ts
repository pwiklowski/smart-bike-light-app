import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { CurrentStateComponent } from './current-state/current-state.component';
import { OnBoardingComponent } from './on-boarding/on-boarding.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BLE } from '@ionic-native/ble/ngx';
import { AnimationPickerComponent } from './settings/animation-picker/animation-picker.component';

@NgModule({
  declarations: [AppComponent, SettingsComponent, CurrentStateComponent, OnBoardingComponent, AnimationPickerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatSliderModule,
    FormsModule,
    IonicModule.forRoot(),
  ],
  providers: [BLE],
  bootstrap: [AppComponent],
})
export class AppModule {}
