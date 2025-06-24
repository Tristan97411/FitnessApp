const EventEmitter = jest.fn();

const requireNativeModule = jest.fn(() => ({}));

const requireOptionalNativeModule = jest.fn(() => ({})); // 👈 ajout essentiel

const NativeModulesProxy = {};

module.exports = {
  EventEmitter,
  requireNativeModule,
  requireOptionalNativeModule,
  NativeModulesProxy,
};
