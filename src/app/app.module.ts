import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { CurrentStateComponent } from './current-state/current-state.component';
import { OnBoardingComponent } from './on-boarding/on-boarding.component';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    CurrentStateComponent,
    OnBoardingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
