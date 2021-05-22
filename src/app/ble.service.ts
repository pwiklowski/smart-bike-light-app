import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BLE } from '@ionic-native/ble/ngx';

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
  device;

  connected$ = new BehaviorSubject<boolean>(false);
  isDiscoverable$ = new BehaviorSubject<boolean>(false);

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

  CHAR_UUID_FRONT_CONFIG = '10c96904-75a0-e2a0-fe48-125237297f2c';

  CHAR_UUID_BATTERY_LEVEL = '2a19';

  lastMessageId = 0;
  callbackMap = new Map<number, Function>();

  constructor(private ble: BLE) {}

  async init() {}

  async getPairedDevices() {
    let devices = await navigator.bluetooth.getDevices();

    return devices.filter((device) => device.name === this.DEVICE_NAME);
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
    // let devices = await navigator.bluetooth.getDevices();
    // return devices.length > 0;

    return true;
  }

  scanStart() {
    return this.ble.startScanWithOptions([this.SERVICE_LIGHT, this.SERVICE_BATTERY], { reportDuplicates: true });
  }

  async scanStop() {
    this.ble.stopScan();
  }

  async connect(deviceMac) {
    this.ble.connect(deviceMac).subscribe(
      (device) => this.onConnected(device),
      (device) => this.onDisconnected(device)
    );
  }

  async onConnected(device) {
    this.device = device;
    console.log('on connected');
    this.connected$.next(true);

    let messageLength = -1;
    let messageId = -1;
    let message = new Uint8Array();
    this.ble.startNotification(this.device.id, this.SERVICE_LIGHT, this.CHAR_UUID_FRONT_CONFIG).subscribe(
      (value) => {
        if (messageLength === -1) {
          let buffer = new DataView(value[0], 0);
          messageId = buffer.getUint16(0, true);
          messageLength = buffer.getUint16(2, true);

          if (messageLength === 0) {
            const callback = this.callbackMap.get(messageId);
            callback(message);
            this.callbackMap.delete(messageId);
            messageLength = -1;
            messageId = -1;
            message = new Uint8Array();
          }
        } else {
          message = new Uint8Array([...message, ...new Uint8Array(value[0])]);

          if (messageLength === message.length) {
            const callback = this.callbackMap.get(messageId);

            callback(message);
            this.callbackMap.delete(messageId);
            messageLength = -1;
            messageId = -1;
            message = new Uint8Array();
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onDisconnected(device) {
    console.log('on disconnected');
    this.connected$.next(false);
    this.init();
  }

  async disconnect() {
    return this.ble.disconnect(this.device?.id);
  }

  async getValue(serviceUuid: string, characteristicUuid: string): Promise<Uint8Array> {
    const buffer = await this.ble.read(this.device.id, serviceUuid, characteristicUuid);
    return new Uint8Array(buffer);
  }

  async setValue(serviceUuid: string, characteristicUuid: string, value: Uint8Array) {
    console.log('set', characteristicUuid, value);
    return this.ble.writeWithoutResponse(this.device.id, serviceUuid, characteristicUuid, value.buffer);
  }

  async setFrontLight(enabled: boolean) {
    let value = Uint8Array.of(enabled ? 1 : 0);
    await this.setValue(this.SERVICE_LIGHT, this.CHAR_UUID_FRONT_LIGHT_TOGGLE, value);
  }

  async setBackLight(enabled: boolean) {
    let value = Uint8Array.of(enabled ? 1 : 0);
    await this.setValue(this.SERVICE_LIGHT, this.CHAR_UUID_BACK_LIGHT_TOGGLE, value);
  }

  async setFrontLightAnimation(setting: string) {
    const payload = {
      setting,
    };
    const response: any = await this.request({ url: '/config/front', value: payload });
    return [response.setting, response.value.power, response.value.red, response.value.green, response.value.blue];
  }

  async setBackLightAnimation(setting: string) {
    const payload = {
      setting,
    };
    const response: any = await this.request({ url: '/config/back', value: payload });
    return [response.setting, response.value.power, response.value.red, response.value.green, response.value.blue];
  }

  async setFrontLightAnimationParameters(power: number, red: number, green: number, blue: number) {
    const payload = {
      power,
      red,
      green,
      blue,
    };
    const response: any = await this.request({ url: '/config/front', value: payload });
    return [response.setting, response.value.power, response.value.red, response.value.green, response.value.blue];
  }

  async setBackLightAnimationParameters(power: number, red: number, green: number, blue: number) {
    const payload = {
      power,
      red,
      green,
      blue,
    };
    const response: any = await this.request({ url: '/config/back', value: payload });
    return [response.setting, response.value.power, response.value.red, response.value.green, response.value.blue];
  }

  async getFrontLightAnimationParameters() {
    const response: any = await this.request({ url: '/config/front' });
    return [response.setting, response.value.power, response.value.red, response.value.green, response.value.blue];
  }

  async getBackLightAnimationParameters() {
    const response: any = await this.request({ url: '/config/back' });
    return [response.setting, response.value.power, response.value.red, response.value.green, response.value.blue];
  }

  async getBatteryLevel() {
    let value = await this.getValue(this.SERVICE_BATTERY, this.CHAR_UUID_BATTERY_LEVEL);
    return value[0];
  }

  request(message) {
    return new Promise((resolve, reject) => {
      const messageId = Uint8Array.of(this.lastMessageId << 8, this.lastMessageId & 0xff);
      const request = new Uint8Array([...messageId, ...new TextEncoder().encode(JSON.stringify(message)), 0]);

      this.callbackMap.set(this.lastMessageId, (response) => {
        const responseObject = JSON.parse(new TextDecoder().decode(response));
        console.log(responseObject);
        resolve(responseObject);
      });
      this.lastMessageId++;
      this.ble.writeWithoutResponse(this.device.id, this.SERVICE_LIGHT, this.CHAR_UUID_FRONT_CONFIG, request.buffer);
    });
  }
}
