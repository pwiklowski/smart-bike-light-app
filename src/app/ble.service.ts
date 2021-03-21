import { Injectable } from '@angular/core';
import { GuardsCheckEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export enum LightAnimation {
  SOLID,
  PULSE,
  SNAKE,
  CHRISTMAS,
  CHRISTMAS2,
}

@Injectable({
  providedIn: 'root',
})
export class BleService {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  services: Array<BluetoothRemoteGATTService>;

  connected$ = new BehaviorSubject<boolean>(false);
  isDiscoverable$ = new BehaviorSubject<boolean>(false);
  abortController = new AbortController();

  DEVICE_LOSS_TIMEOUT = 5000;
  deviceLossTimout;

  interval;

  SERVICE_LIGHT = '000000ff-0000-1000-8000-00805f9b34fb';

  CHAR_UUID_FRONT_LIGHT_TOGGLE = 0xff01;
  CHAR_UUID_FRONT_LIGHT_MODE = 0xff02;
  CHAR_UUID_FRONT_LIGHT_SETTING = 0xff03;

  CHAR_UUID_BACK_LIGHT_TOGGLE = 0xff04;
  CHAR_UUID_BACK_LIGHT_MODE = 0xff05;
  CHAR_UUID_BACK_LIGHT_SETTING = 0xff06;

  async init() {
    let devices = await navigator.bluetooth.getDevices();
    console.log('init', devices);
    if (devices.length > 0) {
      const device = devices[0];
      await this.watchForAdvertisments(device);
      await this.connect(device);
    }
  }

  async watchForAdvertisments(device) {
    this.abortController = new AbortController();
    device.addEventListener('advertisementreceived', this.advertismentReceived.bind(this));
    await device.watchAdvertisements({ signal: this.abortController.signal });
  }
  async unwatchForAdvertisments() {
    this.device.removeEventListener('advertisementreceived', this.advertismentReceived.bind(this));
    this.abortController.abort();
  }

  async advertismentReceived(event: any) {
    console.log('Device Name: ' + event.device.name);
    this.isDiscoverable$.next(true);

    clearInterval(this.deviceLossTimout);
    this.deviceLossTimout = setTimeout(() => {
      this.isDiscoverable$.next(false);
    }, this.DEVICE_LOSS_TIMEOUT);
  }

  async isPaired() {
    let devices = await navigator.bluetooth.getDevices();
    return devices.length > 0;
  }

  async scanAndConnect() {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'smart-bike-light' }],
      optionalServices: [this.SERVICE_LIGHT],
    });

    this.connect(device);
  }

  async connectToDevice() {
    let devices = await navigator.bluetooth.getDevices();
    console.log('init', devices);
    if (devices.length > 0) {
      this.connect(devices[0]);
    }
  }

  async connect(device) {
    this.device = device;

    this.unwatchForAdvertisments();

    console.log('Connecting to GATT Server...', this.device);
    this.server = await this.device.gatt.connect();
    this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
    this.readState();
    this.connected$.next(true);
  }

  onDisconnected() {
    console.log('on disconnected');
    this.connected$.next(false);
    this.init();
  }

  async disconnect() {
    this.server.disconnect();
  }

  async readValue(
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): Promise<DataView> {
    //TODO optimize it by storing characterisic references
    const service = await this.server.getPrimaryService(serviceUuid);
    const characteristic = await service.getCharacteristic(characteristicUuid);
    const value = await characteristic.readValue();
    return value;
  }

  async setValue(
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    value: BufferSource
  ) {
    //TODO optimize it by storing characterisic references
    const service = await this.server.getPrimaryService(serviceUuid);
    const characteristic = await service.getCharacteristic(characteristicUuid);
    await characteristic.writeValue(value);
  }

  async readState() {}

  async setFrontLight(enabled: boolean) {
    let value = Uint8Array.of(enabled ? 1 : 0);
    await this.setValue(this.SERVICE_LIGHT, this.CHAR_UUID_FRONT_LIGHT_TOGGLE, value);
  }

  async setBackLight(enabled: boolean) {
    let value = Uint8Array.of(enabled ? 1 : 0);
    await this.setValue(this.SERVICE_LIGHT, this.CHAR_UUID_BACK_LIGHT_TOGGLE, value);
  }

  async setFrontLightAnimation(animation: number) {
    let value = Uint8Array.of(animation);
    await this.setValue(this.SERVICE_LIGHT, this.CHAR_UUID_FRONT_LIGHT_MODE, value);
  }

  async setBackLightAnimation(animation: number) {
    let value = Uint8Array.of(animation);
    await this.setValue(this.SERVICE_LIGHT, this.CHAR_UUID_BACK_LIGHT_MODE, value);
  }

  async setFrontLightAnimationParameters(power: number, red: number, green: number, blue: number) {
    let value = Uint8Array.of(power, red, green, blue);
    await this.setValue(this.SERVICE_LIGHT, this.CHAR_UUID_FRONT_LIGHT_SETTING, value);
  }

  async setBackLightAnimationParameters(power: number, red: number, green: number, blue: number) {
    let value = Uint8Array.of(power, red, green, blue);
    await this.setValue(this.SERVICE_LIGHT, this.CHAR_UUID_BACK_LIGHT_SETTING, value);
  }
}
