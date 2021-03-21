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

  //TODO read them
  frontPower = 0;
  frontRed = 0;
  frontGreen = 0;
  frontBlue = 0;

  backPower = 0;
  backRed = 0;
  backGreen = 0;
  backBlue = 0;

  constructor(private bleService: BleService, private router: Router) {
    this.animations = EnumValues.getNames(LightAnimation);
  }

  ngOnInit(): void {}

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
