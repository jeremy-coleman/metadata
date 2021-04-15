import { AppService } from './app.service';
export
@Controller()
@Reflect.metadata('design:type', Function)
@Reflect.metadata('design:paramtypes', [
  typeof AppService === 'undefined' ? Object : AppService,
])
class AppController {
  constructor(appService) {
    this.appService = appService;
  }

  @Inject()
  @Reflect.metadata(
    'design:type',
    typeof AppService === 'undefined' ? Object : AppService
  )
  appService;
  @Inject()
  @Reflect.metadata(
    'design:type',
    typeof AppService === 'undefined' ? Object : AppService
  )
  appService2;

  @Get()
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [])
  getHello() {
    return this.appService.getHello();
  }
}
