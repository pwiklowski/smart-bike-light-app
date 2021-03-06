import { Router } from '@angular/router';
import { BleService } from './../ble.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-current-state',
  templateUrl: './current-state.component.html',
  styleUrls: ['./current-state.component.scss'],
})
export class CurrentStateComponent implements OnInit {
  batteryLevelWidth: number = 0;
  batteryPercent: number;
  constructor(private bleService: BleService, private router: Router) {}

  async ngOnInit() {
    this.batteryPercent = await this.bleService.getBatteryLevel();
    this.setBatteryProgress(this.batteryPercent);
  }

  async turnOn() {
    await this.bleService.setLight(true);
  }

  async turnOff() {
    await this.bleService.setLight(false);
  }

  async disconnect() {
    await this.bleService.disconnect();
    this.router.navigate(['/']);
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }

  setBatteryProgress(percent: number) {
    const MAX_WIDTH = 154;
    this.batteryLevelWidth = (percent / 100) * MAX_WIDTH;
  }
}
