import { Decorate } from './Decorate';
const sym = Symbol();

@Decorate()
@Reflect.metadata('design:type', Function)
@Reflect.metadata('design:paramtypes', [
  typeof String === 'undefined' ? Object : String,
  typeof Number === 'undefined' ? Object : Number,
  Number,
  String,
  Boolean,
  String,
  Number,
  typeof Object === 'undefined' ? Object : Object,
  Function,
  String,
  Object,
  typeof Function === 'undefined' ? Object : Function,
  void 0,
  void 0,
  Object,
  Function,
  Boolean,
  Boolean,
  String,
])
class Sample {
  constructor(
    p0,
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
    p7,
    p8,
    p9,
    p10,
    p11,
    p12,
    p13,
    p14,
    p15,
    p16,
    p17,
    p18 = 'abc'
  ) {
    this.p0 = p0;
  }

  @Decorate
  @_dec
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [
    typeof Symbol === 'undefined' ? Object : Symbol,
    Object,
    String,
    void 0,
    String,
    String,
    typeof Maybe === 'undefined' ? Object : Maybe,
    Object,
    Object,
    Array,
    Array,
    void 0,
    Boolean,
    void 0,
    String,
    typeof Object === 'undefined' ? Object : Object,
    Object,
    Number,
  ])
  method(
    p0,
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
    p7,
    p8,
    p9,
    p10,
    p11,
    p12,
    p13,
    p14,
    p15,
    p16,
    p17
  ) {}
  /**
   * Member Expression
   */

  @Decorate()
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [
    typeof Decorate.Name === 'undefined' ? Object : Decorate.Name,
    typeof Decorate.Name === 'undefined' ? Object : Decorate.Name,
  ])
  method2(p0 = 'abc', p1) {}
  /**
   * Assignments
   */

  @Decorate()
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [String])
  assignments(p0 = 'abc') {}
}

function _dec(target, key) {
  return Arg()(target, key, 0);
}
