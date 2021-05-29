import { Router } from '@angular/router';
import { BleService } from './../ble.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  animations: string[];

  lights: Array<object>; //TODO add model
  config: Map<string, object> = new Map(); //TODO add model

  constructor(
    private bleService: BleService,
    private router: Router,
    private loadingController: LoadingController,
    private ngZone: NgZone
  ) {
    this.lights = this.bleService.lights;
    console.log(this.lights);
  }

  async ngOnInit() {
    console.log('init');
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });

    this.ngZone.run(async () => {
      await loading.present();

      this.config['front'] = await this.bleService.getLightAnimationParameters('front');
      this.config['back'] = await this.bleService.getLightAnimationParameters('back');

      console.log(this.config);

      console.log('loaded');

      await loading.dismiss();
    });
  }

  async onAnimationChanged(light: string, animation: string) {
    await this.bleService.setLightAnimation(light, animation);
  }

  openCurrentState() {
    this.router.navigate(['/state']);
  }

  async updateLightSettings(light, property, $event = null) {
    console.log('updateLightSettings', light, property, $event);
    await this.bleService.setLightAnimationParameters(light, property, $event);
  }
}
