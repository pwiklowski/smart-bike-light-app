import { Router } from '@angular/router';
import { BleService, LightAnimation } from './../ble.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { EnumValues } from 'enum-values';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  animations: string[];

  frontMode: string;
  frontPower = 0;
  frontRed = 0;
  frontGreen = 0;
  frontBlue = 0;

  backMode: string;
  backPower = 0;
  backRed = 0;
  backGreen = 0;
  backBlue = 0;

  constructor(
    private bleService: BleService,
    private router: Router,
    private loadingController: LoadingController,
    private ngZone: NgZone
  ) {
    this.animations = EnumValues.getNames(LightAnimation);
  }

  async ngOnInit() {
    console.log('init');
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });

    this.ngZone.run(async () => {
      await loading.present();

      [this.frontMode, this.frontPower, this.frontRed, this.frontGreen, this.frontBlue] =
        await this.bleService.getFrontLightAnimationParameters();

      [this.backMode, this.backPower, this.backRed, this.backGreen, this.backBlue] =
        await this.bleService.getBackLightAnimationParameters();

      console.log(this.frontMode, this.frontPower, this.frontRed, this.frontGreen, this.frontBlue);
      console.log(this.backMode, this.backPower, this.backRed, this.backGreen, this.backBlue);

      console.log('loaded');

      await loading.dismiss();
    });
  }

  async onFrontAnimationChanged($event) {
    await this.bleService.setFrontLightAnimation(this.frontMode);
  }

  async onBackAnimationChanged($event) {
    await this.bleService.setBackLightAnimation(this.backMode);
  }

  openCurrentState() {
    this.router.navigate(['/state']);
  }

  async updateFrontLightSettings($event = null) {
    await this.bleService.setFrontLightAnimationParameters(
      this.frontPower,
      this.frontRed,
      this.frontGreen,
      this.frontBlue
    );
  }

  async updateBackLightSettings($event = null) {
    await this.bleService.setBackLightAnimationParameters(this.backPower, this.backRed, this.backGreen, this.backBlue);
  }
}
