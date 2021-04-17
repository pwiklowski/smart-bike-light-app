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

  DEVICE_NAME = 'smart-bike-light';

  SERVICE_LIGHT = '10c96900-75a0-e2a0-fe48-125237297f2c';
  SERVICE_BATTERY = '0000180f-0000-1000-8000-00805f9b34fb';

  CHAR_UUID_FRONT_LIGHT_TOGGLE = '10c96901-75a0-e2a0-fe48-125237297f2c';
  CHAR_UUID_FRONT_LIGHT_MODE = '10c96902-75a0-e2a0-fe48-125237297f2c';
  CHAR_UUID_FRONT_LIGHT_SETTING = '10c96903-75a0-e2a0-fe48-125237297f2c';

  CHAR_UUID_BACK_LIGHT_TOGGLE = '10c96911-75a0-e2a0-fe48-125237297f2c';
  CHAR_UUID_BACK_LIGHT_MODE = '10c96912-75a0-e2a0-fe48-125237297f2c';
  CHAR_UUID_BACK_LIGHT_SETTING = '10c96913-75a0-e2a0-fe48-125237297f2c';

  CHAR_UUID_BATTERY_LEVEL = 0x2a19;

  async init() {
    let devices = await this.getPairedDevices();

    if (devices.length > 0) {
      const device = devices[0];
      await this.watchForAdvertisments(device);
      await this.connect(device);
    }
  }

  async getPairedDevices() {
    let devices = await navigator.bluetooth.getDevices();

    return devices.filter((device) => device.name === this.DEVICE_NAME);
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
      filters: [{ name: this.DEVICE_NAME }],
      optionalServices: [this.SERVICE_LIGHT, this.SERVICE_BATTERY],
    });

    this.connect(device);
  }

  async connectToDevice() {
    let devices = await this.getPairedDevices();
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

  async getValue(
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

  async getFrontLightAnimation() {
    let value = await this.getValue(this.SERVICE_LIGHT, this.CHAR_UUID_FRONT_LIGHT_MODE);
    return value.getUint8(0);
  }

  async getBackLightAnimation() {
    let value = await this.getValue(this.SERVICE_LIGHT, this.CHAR_UUID_BACK_LIGHT_MODE);
    return value.getUint8(0);
  }

  async getFrontLightAnimationParameters() {
    let value = await this.getValue(this.SERVICE_LIGHT, this.CHAR_UUID_FRONT_LIGHT_SETTING);

    const power = value.getUint8(0);
    const red = value.getUint8(1);
    const green = value.getUint8(2);
    const blue = value.getUint8(3);

    return [power, red, green, blue];
  }

  async getBackLightAnimationParameters() {
    let value = await this.getValue(this.SERVICE_LIGHT, this.CHAR_UUID_BACK_LIGHT_SETTING);

    const power = value.getUint8(0);
    const red = value.getUint8(1);
    const green = value.getUint8(2);
    const blue = value.getUint8(3);

    return [power, red, green, blue];
  }

  async getBatteryLevel() {
    let value = await this.getValue(this.SERVICE_BATTERY, this.CHAR_UUID_BATTERY_LEVEL);
    return value.getUint8(0);
  }
}
