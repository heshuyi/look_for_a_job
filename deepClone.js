var clone = (function() {
    //这个方法用来获取对象的类型 返回值为字符串类型 "Object RegExp Date Array..."
    var classof = function(o) {
        if (o === null) {
            return "null";
        }
        if (o === undefined) {
            return "undefined";
        }
        // 这里的Object.prototype.toString很可能用的就是Object.prototype.constructor.name
        // 这里使用Object.prototype.toString来生成类型字符串
        var className = Object.prototype.toString.call(o).slice(8, -1);
        return className;
    };


    //这里这个变量我们用来存储已经保存过的属性，目的在于处理循环引用的问题
    var references = null;


    //遇到不同类型的对象的处理方式
    var handlers = {
        //正则表达式的处理
        'RegExp': function(reg) {
            var flags = '';
            flags += reg.global ? 'g' : '';
            flags += reg.multiline ? 'm' : '';
            flags += reg.ignoreCase ? 'i' : '';
            return new RegExp(reg.source, flags);
        },
        //时间对象处理
        'Date': function(date) {
            return new Date(+date);
        },
        //数组处理 第二个参数为是否做浅拷贝
        'Array': function(arr, shallow) {
            var newArr = [],
            i;
            for (i = 0; i < arr.length; i++) {
                if (shallow) {
                    newArr[i] = arr[i];
                } else {
                    //这里我们通过reference数组来处理循环引用问题
                    if (references.indexOf(arr[i]) !== -1) {
                        continue;
                    }
                    var handler = handlers[classof(arr[i])];
                    if (handler) {
                        references.push(arr[i]);
                        newArr[i] = handler(arr[i], false);
                    } else {
                        newArr[i] = arr[i];
                    }
                }
            }
            return newArr;
        },
        //正常对象的处理 第二个参数为是否做浅拷贝
        'Object': function(obj, shallow) {
            var newObj = {}, prop, handler;
            for (prop in obj) {
                //关于原型中属性的处理太过复杂，我们这里暂时不做处理
                //所以只对对象本身的属性做拷贝
                if (obj.hasOwnProperty(prop)) {
                    if (shallow) {
                        newObj[prop] = obj[prop];
                    } else {
                        //这里还是处理循环引用的问题
                        if (references.indexOf(obj[prop]) !== -1) {
                            continue;
                        }


                        handler = handlers[classof(obj[prop])];
                        //如果没有对应的处理方式，那么就直接复制
                        if (handler) {
                            references.push(obj[prop]);
                            newObj[prop] = handler(obj[prop], false);
                        } else {
                            newObj[prop] = obj[prop];
                        }
                    }
                }
            }
            return newObj;
        }
    };


    return function(obj, shallow) {
        //首先重置我们用来处理循环引用的这个变量
        references = [];
        //我们默认处理为浅拷贝
        shallow = shallow === undefined ? true : false;
        var handler = handlers[classof(obj)];
        return handler ? handler(obj, shallow) : obj;
    };
}());


(function() {
    //下面是一些测试代码
    var date = new Date();
    var reg = /hello word/gi;
    var obj = {
        prop: 'this ia a string',
        arr: [1, 2, 3],
        o: {
            wow: 'aha'
        }
    };
    var refer1 = {
        arr: [1, 2, 3]
    };
    var refer2 = {
        refer: refer1
    };
    refer1.refer = refer2;


    var cloneDate = clone(date, false);
    var cloneReg = clone(reg, false);
    var cloneObj = clone(obj, false);
    alert((date !== cloneDate) && (date.valueOf() === cloneDate.valueOf()));
    alert((cloneReg !== reg) && (reg.toString() === cloneReg.toString()));
    alert((obj !== cloneObj) && (obj.arr !== cloneObj.arr) && (obj.o !== cloneObj.o) && (JSON.stringify(obj) === JSON.stringify(cloneObj)));


    clone(refer2, false);
    alert("I'm not dead yet!");
    // Output:
    // true
    // true
    // true
    // I'm not dead yet!
}());