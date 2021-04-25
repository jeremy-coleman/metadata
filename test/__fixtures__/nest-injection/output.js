import { DesignType as _DesignType } from "@proteria/metadata";
import { createType as _type } from "@proteria/metadata";
import { AppService } from "./app.service";
export
@Controller()
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, [
  _type(() => (typeof AppService === "undefined" ? Object : AppService)),
])
@Reflect.metadata(_DesignType.PropertyList, ["appService", "appService2"])
@Reflect.metadata(_DesignType.MethodList, ["appService", "getHello"])
class AppController {
  constructor(appService) {
    this.appService = appService;
  }

  @Inject()
  @Reflect.metadata(
    _DesignType.Type,
    _type(() => (typeof AppService === "undefined" ? Object : AppService))
  )
  appService;
  @Inject()
  @Reflect.metadata(
    _DesignType.Type,
    _type(() => (typeof AppService === "undefined" ? Object : AppService))
  )
  appService2;

  @Get()
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [])
  @Reflect.metadata(_DesignType.ReturnType, _type(() => String))
  getHello() {
    return this.appService.getHello();
  }
}
