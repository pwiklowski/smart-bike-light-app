import { Router } from '@angular/router';
import { BleService, LightAnimation } from './../ble.service';
import { Component, OnInit } from '@angular/core';
import { EnumValues } from 'enum-values';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  animations: string[];

  frontMode = 0;
  frontPower = 0;
  frontRed = 0;
  frontGreen = 0;
  frontBlue = 0;

  backMode = 0;
  backPower = 0;
  backRed = 0;
  backGreen = 0;
  backBlue = 0;

  constructor(private bleService: BleService, private router: Router) {
    this.animations = EnumValues.getNames(LightAnimation);
  }

  async ngOnInit() {
    this.frontMode = await this.bleService.getFrontLightAnimation();
    this.backMode = await this.bleService.getBackLightAnimation();

    console.log(this.frontMode, this.backMode);

    [
      this.frontPower,
      this.frontRed,
      this.frontGreen,
      this.frontBlue,
    ] = await this.bleService.getFrontLightAnimationParameters();

    [
      this.backPower,
      this.backRed,
      this.backGreen,
      this.backBlue,
    ] = await this.bleService.getBackLightAnimationParameters();
  }

  async onFrontAnimationChanged($event) {
    console.log($event);
    await this.bleService.setFrontLightAnimation($event.value);
  }

  async onBackAnimationChanged($event) {
    console.log($event);
    await this.bleService.setBackLightAnimation($event.value);
  }

  openCurrentState() {
    this.router.navigate(['/state']);
  }

  async updateFrontLightSettings() {
    await this.bleService.setFrontLightAnimationParameters(
      this.frontPower,
      this.frontRed,
      this.frontGreen,
      this.frontBlue
    );
  }

  async updateBackLightSettings() {
    await this.bleService.setBackLightAnimationParameters(this.backPower, this.backRed, this.backGreen, this.backBlue);
  }
}
