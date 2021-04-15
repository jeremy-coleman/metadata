'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.SomeService = void 0;

var _awsSdk = _interopRequireDefault(require('aws-sdk'));

@Injectable()
@_dec
@Reflect.metadata('design:type', Function)
@Reflect.metadata('design:paramtypes', [
  typeof _awsSdk.default.S3 === 'undefined' ? Object : _awsSdk.default.S3,
])
class SomeService {
  constructor(s3client) {
    this.s3client = s3client;
  }
}

exports.SomeService = SomeService;

function _dec(target, key) {
  return Inject('aws.s3')(target, undefined, 0);
}
