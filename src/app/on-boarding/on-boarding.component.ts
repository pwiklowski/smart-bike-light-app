import { Component, OnInit, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { BleService } from '../ble.service';
import { BleScanResult, GapAdType, parseAdvertisingData } from '../ble.utils';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss'],
})
export class OnBoardingComponent {
  state: string;
  connected: boolean;
  isPaired: boolean;
  onDestroy$ = new Subject();

  devices = new Map<string, BleScanResult>();

  constructor(public bleService: BleService, private ngZone: NgZone) {
    this.bleService.connected$.subscribe(
      (connected: boolean) => {
        this.connected = connected;
      },
      () => {}
    );
  }

  connect(device_uuid: string) {
    this.bleService.connect(device_uuid);
  }

  async ngOnInit() {
    this.isPaired = await this.bleService.isPaired();

    this.bleService
      .scanStart()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((device) => {
        this.ngZone.run(() => {
          this.devices.set(device.id, new BleScanResult(device));
        });
      });
  }

  async ngOnDestroy() {
    this.onDestroy$.next();
    await this.bleService.scanStop();
  }
}
