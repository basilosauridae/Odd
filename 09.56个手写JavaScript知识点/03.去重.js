    // 1.简单数组类型去重
    // let arr = [1,2,3,4,4]
    // let arr2 = [...new Set(arr)]
    // console.log(new Set(arr),arr2,Array.from(new Set(arr)));

    // 2.复杂数组去重 根据数组一项的某一个属性值去重 如列表id去重
    // let arr = [
    //   { a:1,id:1 },
    //   { a:2,id:2 },
    //   { a:3,id:3 },
    //   { a:3,id:3 },
    // ]
    // function unique(arr) {
    //   let res = []
    //   arr.forEach(element => {
    //     let ids = res.map(i => i.id)
    //     if(!ids.includes(element.id)){//ids.indexOf(element.id)===-1
    //       res.push(element)
    //     }
    //   })
    //   return res
    // }
    // console.log(unique(arr));

    // var array = [1, 2, 1, 1, '1'];
    // function unique(array) {
    //   var res = array.filter(function(item, index, array){
    //     console.log( array.indexOf(item),'@',item, index);
    //     return array.indexOf(item) === index;
    //   })
    //   return res;
    // }
    // console.log(unique(array));

    // 3.filter方法简化外层循环
    // let arr = [
    //   { a:1,id:1 },
    //   { a:2,id:2 },
    //   { a:3,id:3 },
    //   { a:3,id:3 },
    // ]
    // function unique(arr) {
    //   let res = arr.filter((item,index)=>{
    //     return arr.map(i=>i.id).indexOf(item.id)===index//indexOf如果找到符合条件的下标就不找了
    //   })
    //   return res
    // }
    // console.log(unique(arr));

    // 4.去重注意，indexOf 底层还是使用 === 进行判断，因为 NaN === NaN的结果为 false，所以使用 indexOf 查找不到 NaN 元素
    // demo1
    var arr = [1, 2, NaN];
    arr.indexOf(NaN); // -1

    // demo2，Set 认为尽管 NaN === NaN 为 false，但是这两个元素是重复的
    function unique(array) {
      return Array.from(new Set(array));
    }
    console.log(unique([NaN, NaN])) // [NaN]