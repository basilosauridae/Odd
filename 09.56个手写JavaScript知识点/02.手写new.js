function Person(name,age) {
  this.name = name //手写第三步 obj.name = name
  this.age = age
  this.sayHi = function () { console.log('hi') }

  return true
  //  return /a/
  // return {}
}
Person.prototype.hobby = 'sing'
Person.prototype.sayHello = function () {console.log( 'hello' )}
const p = new Person('hy',18)
// new出来的实例可以访问构造函数身上的属性和方法 原型链同理
console.log( '原生new----------------------------------------------' );
console.log( p.name )
console.log( p.age )
p.sayHi()
console.log( p.hobby )
p.sayHello()

/* new做了哪四件事情
1.创建了一个空对象
2.将对象的__proto__指向构造函数的原型对象
3.将构造函数的this指向对象，执行这个构造函数，为对象添加属性和方法
4.返回这个新对象
*/

function _new(ctor,...argus) {
  if(typeof ctor !== 'function'){
      throw 'ctor must be function!'
  }
  let obj = {} //new Object(), Object.create(null)
  obj.__proto__ = ctor.prototype //Object.create(ctor.prototype), Object.setPrototypeOf()
  // 通过apply强行地把构造函数的this指向obj
  const res = ctor.apply(obj,[...argus]) 

  let isObject = typeof res === 'object' && res !== null
  let isFunction = typeof res === 'function'

  return isObject || isFunction ? res : obj
}
console.log( '手写new----------------------------------------------' );
const p1 = _new(Person,'lt',20)
console.log( p1.name )
console.log( p1.age )
p1.sayHi()
console.log( p1.hobby )
p1.sayHello()

// 为什么不用Object.create(ctor.prototype)：
// console.log( p,'原生' )
// console.log( p1,'手写' )