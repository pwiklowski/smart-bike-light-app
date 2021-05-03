export enum GapAdType {
  BLE_GAP_AD_TYPE_FLAGS = 0x01 /**< Flags for discoverability. */,
  BLE_GAP_AD_TYPE_16BIT_SERVICE_UUID_MORE_AVAILABLE = 0x02 /**< Partial list of 16 bit service UUIDs. */,
  BLE_GAP_AD_TYPE_16BIT_SERVICE_UUID_COMPLETE = 0x03 /**< Complete list of 16 bit service UUIDs. */,
  BLE_GAP_AD_TYPE_32BIT_SERVICE_UUID_MORE_AVAILABLE = 0x04 /**< Partial list of 32 bit service UUIDs. */,
  BLE_GAP_AD_TYPE_32BIT_SERVICE_UUID_COMPLETE = 0x05 /**< Complete list of 32 bit service UUIDs. */,
  BLE_GAP_AD_TYPE_128BIT_SERVICE_UUID_MORE_AVAILABLE = 0x06 /**< Partial list of 128 bit service UUIDs. */,
  BLE_GAP_AD_TYPE_128BIT_SERVICE_UUID_COMPLETE = 0x07 /**< Complete list of 128 bit service UUIDs. */,
  BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME = 0x08 /**< Short local device name. */,
  BLE_GAP_AD_TYPE_COMPLETE_LOCAL_NAME = 0x09 /**< Complete local device name. */,
  BLE_GAP_AD_TYPE_TX_POWER_LEVEL = 0x0a /**< Transmit power level. */,
  BLE_GAP_AD_TYPE_CLASS_OF_DEVICE = 0x0d /**< Class of device. */,
  BLE_GAP_AD_TYPE_SIMPLE_PAIRING_HASH_C = 0x0e /**< Simple Pairing Hash C. */,
  BLE_GAP_AD_TYPE_SIMPLE_PAIRING_RANDOMIZER_R = 0x0f /**< Simple Pairing Randomizer R. */,
  BLE_GAP_AD_TYPE_SECURITY_MANAGER_TK_VALUE = 0x10 /**< Security Manager TK Value. */,
  BLE_GAP_AD_TYPE_SECURITY_MANAGER_OOB_FLAGS = 0x11 /**< Security Manager Out Of Band Flags. */,
  BLE_GAP_AD_TYPE_SLAVE_CONNECTION_INTERVAL_RANGE = 0x12 /**< Slave Connection Interval Range. */,
  BLE_GAP_AD_TYPE_SOLICITED_SERVICE_UUIDS_16BIT = 0x14 /**< List of 16-bit Service Solicitation UUIDs. */,
  BLE_GAP_AD_TYPE_SOLICITED_SERVICE_UUIDS_128BIT = 0x15 /**< List of 128-bit Service Solicitation UUIDs. */,
  BLE_GAP_AD_TYPE_SERVICE_DATA = 0x16 /**< Service Data - 16-bit UUID. */,
  BLE_GAP_AD_TYPE_PUBLIC_TARGET_ADDRESS = 0x17 /**< Public Target Address. */,
  BLE_GAP_AD_TYPE_RANDOM_TARGET_ADDRESS = 0x18 /**< Random Target Address. */,
  BLE_GAP_AD_TYPE_APPEARANCE = 0x19 /**< Appearance. */,
  BLE_GAP_AD_TYPE_ADVERTISING_INTERVAL = 0x1a /**< Advertising Interval. */,
  BLE_GAP_AD_TYPE_LE_BLUETOOTH_DEVICE_ADDRESS = 0x1b /**< LE Bluetooth Device Address. */,
  BLE_GAP_AD_TYPE_LE_ROLE = 0x1c /**< LE Role. */,
  BLE_GAP_AD_TYPE_SIMPLE_PAIRING_HASH_C256 = 0x1d /**< Simple Pairing Hash C-256. */,
  BLE_GAP_AD_TYPE_SIMPLE_PAIRING_RANDOMIZER_R256 = 0x1e /**< Simple Pairing Randomizer R-256. */,
  BLE_GAP_AD_TYPE_SERVICE_DATA_32BIT_UUID = 0x20 /**< Service Data - 32-bit UUID. */,
  BLE_GAP_AD_TYPE_SERVICE_DATA_128BIT_UUID = 0x21 /**< Service Data - 128-bit UUID. */,
  BLE_GAP_AD_TYPE_LESC_CONFIRMATION_VALUE = 0x22 /**< LE Secure Connections Confirmation Value */,
  BLE_GAP_AD_TYPE_LESC_RANDOM_VALUE = 0x23 /**< LE Secure Connections Random Value */,
  BLE_GAP_AD_TYPE_URI = 0x24 /**< URI */,
  BLE_GAP_AD_TYPE_3D_INFORMATION_DATA = 0x3d /**< 3D Information Data. */,
  BLE_GAP_AD_TYPE_MANUFACTURER_SPECIFIC_DATA = 0xff /**< Manufacturer Specific Data. */,
}

export class BleScanResult {
  adv_data: object;
  rssi: number;

  constructor(device: any) {
    this.adv_data = parseAdvertisingData(device.advertising);
    this.rssi = device.rssi;
  }

  getBatteryLevel() {
    const data = new Uint8Array(this.adv_data[GapAdType.BLE_GAP_AD_TYPE_MANUFACTURER_SPECIFIC_DATA]);
    console.log(data);
    return data[2];
  }
}

export function parseAdvertisingData(buffer) {
  var length,
    type,
    data,
    i = 0,
    advertisementData = {};
  var bytes = new Uint8Array(buffer);

  while (length !== 0) {
    length = bytes[i] & 0xff;
    i++;

    // decode type constants from https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile
    type = bytes[i] & 0xff;
    i++;

    data = bytes.slice(i, i + length - 1).buffer; // length includes type byte, but not length byte
    i += length - 2; // move to end of data
    i++;

    advertisementData[type] = data;
  }

  return advertisementData;
}
