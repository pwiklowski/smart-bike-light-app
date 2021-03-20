import { Router } from '@angular/router';
import { BleService, LightAnimation } from './../ble.service';
import { Component, OnInit } from '@angular/core';
import { EnumValues } from 'enum-values';

@Component({
  selector: 'app-current-state',
  templateUrl: './current-state.component.html',
  styleUrls: ['./current-state.component.scss'],
})
export class CurrentStateComponent implements OnInit {
  constructor(private bleService: BleService, private router: Router) {}

  ngOnInit(): void {}

  turnOn() {
    this.bleService.setFrontLight(true);
    this.bleService.setBackLight(true);
  }

  turnOff() {
    this.bleService.setFrontLight(false);
    this.bleService.setBackLight(false);
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }
}
