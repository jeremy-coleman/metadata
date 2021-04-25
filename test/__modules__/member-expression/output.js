"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.SomeService = void 0;

var _metadata = require("@proteria/metadata");

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

@Injectable()
@_decorateArgument
@Reflect.metadata(_metadata.DesignType.Type, Function)
@Reflect.metadata(_metadata.DesignType.ParamType, [
  (0, _metadata.createType)(() =>
    typeof _awsSdk.default.S3 === "undefined" ? Object : _awsSdk.default.S3
  ),
])
@Reflect.metadata(_metadata.DesignType.PropertyList, [])
@Reflect.metadata(_metadata.DesignType.MethodList, ["s3client"])
class SomeService {
  constructor(s3client) {
    this.s3client = s3client;
  }
}

exports.SomeService = SomeService;

function _decorateArgument(target, key) {
  return Inject("aws.s3")(target, undefined, 0);
}
