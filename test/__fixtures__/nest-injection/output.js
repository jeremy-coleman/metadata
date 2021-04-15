import _initializerDefineProperty from '@babel/runtime/helpers/initializerDefineProperty';
import _applyDecoratedDescriptor from '@babel/runtime/helpers/applyDecoratedDescriptor';
import _initializerWarningHelper from '@babel/runtime/helpers/initializerWarningHelper';

var _dec,
  _dec2,
  _dec3,
  _dec4,
  _dec5,
  _dec6,
  _dec7,
  _dec8,
  _dec9,
  _dec10,
  _class,
  _class2,
  _descriptor,
  _descriptor2;

import { AppService } from './app.service';
export let AppController =
  ((_dec = Controller()),
  (_dec2 = Reflect.metadata('design:type', Function)),
  (_dec3 = Reflect.metadata('design:paramtypes', [
    typeof AppService === 'undefined' ? Object : AppService,
  ])),
  (_dec4 = Inject()),
  (_dec5 = Reflect.metadata(
    'design:type',
    typeof AppService === 'undefined' ? Object : AppService
  )),
  (_dec6 = Inject()),
  (_dec7 = Reflect.metadata(
    'design:type',
    typeof AppService === 'undefined' ? Object : AppService
  )),
  (_dec8 = Get()),
  (_dec9 = Reflect.metadata('design:type', Function)),
  (_dec10 = Reflect.metadata('design:paramtypes', [])),
  _dec(
    (_class =
      _dec2(
        (_class =
          _dec3(
            (_class =
              ((_class2 = class AppController {
                constructor(appService) {
                  this.appService = appService;

                  _initializerDefineProperty(
                    this,
                    'appService',
                    _descriptor,
                    this
                  );

                  _initializerDefineProperty(
                    this,
                    'appService2',
                    _descriptor2,
                    this
                  );
                }

                getHello() {
                  return this.appService.getHello();
                }
              }),
              ((_descriptor = _applyDecoratedDescriptor(
                _class2.prototype,
                'appService',
                [_dec4, _dec5],
                {
                  configurable: true,
                  enumerable: true,
                  writable: true,
                  initializer: null,
                }
              )),
              (_descriptor2 = _applyDecoratedDescriptor(
                _class2.prototype,
                'appService2',
                [_dec6, _dec7],
                {
                  configurable: true,
                  enumerable: true,
                  writable: true,
                  initializer: null,
                }
              )),
              _applyDecoratedDescriptor(
                _class2.prototype,
                'getHello',
                [_dec8, _dec9, _dec10],
                Object.getOwnPropertyDescriptor(_class2.prototype, 'getHello'),
                _class2.prototype
              )),
              _class2))
          ) || _class)
      ) || _class)
  ) || _class);
