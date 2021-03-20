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

  constructor(private bleService: BleService, private router: Router) {
    this.animations = EnumValues.getNames(LightAnimation);
  }

  ngOnInit(): void {}

  onFrontAnimationChanged($event) {
    console.log($event);
    this.bleService.setFrontLightAnimation($event.value);
  }

  onBackAnimationChanged($event) {
    console.log($event);
    this.bleService.setBackLightAnimation($event.value);
  }

  openCurrentState() {
    this.router.navigate(['/state']);
  }
}
