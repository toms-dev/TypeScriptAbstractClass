/// <reference path="../node_modules/reflect-metadata/reflect-metadata" />
require("reflect-metadata");
var KEY_IS_REGULAR = "isRegularClass";
var KEY_IS_ABSTRACT = "isAbstractClass";
var KEY_REGULAR_ENFORCED = "regularEnforced";
function Abstract(constructor) {
    //return constructor;
    var name = constructor.name;
    var argCount = constructor.length;
    var prototype = constructor.prototype;
    Reflect.defineMetadata(KEY_IS_ABSTRACT, true, prototype);
    var isProcessed = false;
    var performChecks = function () {
        var className = constructor.name;
        console.log("Performing checks on ", className);
        // Check child classes
        var instanceProto = this.constructor.prototype;
        // Enforce only child classes
        var isRegular = Reflect.hasOwnMetadata(KEY_IS_REGULAR, instanceProto);
        var isAbstract = Reflect.hasOwnMetadata(KEY_IS_ABSTRACT, instanceProto);
        if (isAbstract) {
            // Only allow the super() call! ;)
            var constructorChain = getProtoChain(instanceProto).map(function (el) {
                return el.constructor;
            });
            var callContext = arguments.callee.caller;
            if (constructorChain.indexOf(callContext) == -1) {
                throw new Error("Can't instantiate an abstract class!");
            }
            console.log("ABSTRACT CLASS '" + className + "' BEING INSTANTIATED!");
        }
        // The class should be either annotation-declared Abstract or Class (regular class)
        // If its not the case, let's shout at the developers for killing the performances by not annotating
        // their class correctly.
        // If the class is not either, someone has forgotten to do something! ;)
        if (!isAbstract && !isRegular) {
            var throwError = false; // what to do ? :)
            var message = "You forgot to annotate class '" + className + "' with @Class.Regular or" +
                " @Class.Abstract !\n" +
                "The abstract class system is designed to resolve problems on app startup only.\n" +
                "It will lower the performance of the first instanciation of the class.";
            if (throwError) {
                throw new Error(message);
            }
            else {
                console.warn(message);
            }
        }
        // Enforce only regular classes
        if (isRegular && instanceProto != prototype) {
            // Enforce only once
            if (!Reflect.hasOwnMetadata(KEY_REGULAR_ENFORCED, instanceProto)) {
                enforceClass(instanceProto);
            }
        }
    };
    var wrappedConstructor = function () {
        if (!isProcessed) {
            performChecks();
            isProcessed = true;
        }
        // Call the original constructor
        constructor.apply(this, arguments);
    };
    var wrapper = new Function('customAction', 'return function ' + name + '() {' +
        'wrappedConstructor.apply(this, arguments)' +
        '}');
    //var result = wrapper(customAction);
    var result = wrappedConstructor;
    result.prototype = prototype;
    return result;
}
exports.Abstract = Abstract;
function AbstractMethod(prototype, key) {
    //console.log("== AbstractMethod", arguments);
    Reflect.defineMetadata(KEY_IS_ABSTRACT, true, prototype);
    // setup abstract methods
    var abstractMethods;
    if (Reflect.hasOwnMetadata("abstractMethods", prototype)) {
        abstractMethods = Reflect.getOwnMetadata("abstractMethods", prototype);
    }
    else {
        abstractMethods = [];
    }
    // Add the method only if its not already registered
    if (abstractMethods.indexOf(key) == -1) {
        abstractMethods.push(key);
    }
    Reflect.defineMetadata("abstractMethods", abstractMethods, prototype);
}
exports.AbstractMethod = AbstractMethod;
function Class(constructor) {
    console.log("== Class ", constructor.name);
    var proto = constructor.prototype;
    Reflect.defineMetadata(KEY_IS_REGULAR, true, proto);
    enforceClass(proto);
}
exports.Class = Class;
function getProtoChain(proto) {
    var parentProto = proto;
    var protoChain = [];
    while (parentProto != Object.prototype) {
        protoChain.push(parentProto);
        parentProto = parentProto.__proto__;
    }
    return protoChain;
}
function getNonImplementedMethods(proto) {
    var protoChain = getProtoChain(proto).reverse();
    console.log("ProtoChain: ", protoChain.map(function (el) {
        return el.constructor.name;
    }));
    var methodsToImplement = [];
    // Process the chain, starting from the highest parent class
    for (var i in protoChain) {
        if (!protoChain.hasOwnProperty(i))
            continue;
        var p = protoChain[i];
        var protoAbstractMethods = Reflect.getOwnMetadata("abstractMethods", p) || [];
        // Get local non-abstract methods (defined in the class)
        var protoNonAbstractMethods = [];
        for (var methodName in p) {
            if (!p.hasOwnProperty(methodName))
                continue;
            var method = p[methodName];
            // Skip non-function attributes
            if (typeof (method) != "function")
                continue;
            // Skip methods that were declared abstract by this class
            if (protoAbstractMethods.indexOf(methodName) != -1)
                continue;
            // TODO: Check params count?
            protoNonAbstractMethods.push(methodName);
        }
        // Now remove the non-abstract methods from the methods to implements
        var newMethodsToImplement = methodsToImplement.filter(function (el, i) {
            // only keep methods that were not implemented and that are not already in the list
            return protoNonAbstractMethods.indexOf(el) == -1;
        });
        methodsToImplement = newMethodsToImplement;
        // Now add all the abstract method that were defined for the child class to process
        Array.prototype.push.apply(methodsToImplement, protoAbstractMethods);
        console.log("Class " + p.constructor.name + " implements: ", protoNonAbstractMethods);
        console.log("Class " + p.constructor.name + " makes its child implement: ", methodsToImplement);
    }
    return methodsToImplement;
}
/*function enforceAbstractR(proto, model, declaredMethods: string[]) {
 var parentProto = proto.__proto__;
 if (parentProto != Object.prototype) {
 enforceAbstract(proto, parentProto);
 } else {
 // no parent, all the methods must be implemented
 }

 console.log("Processing prototype "+proto.constructor.name);
 if (Reflect.getMetadata("isAbstractClass", proto)) {
 console.log("Found child class!");
 processAbstractChildClass(proto);
 }

 }*/
function enforceClass(proto) {
    var nonImpl = getNonImplementedMethods(proto);
    if (nonImpl.length > 0) {
        throw new Error("Methods not implemented in " + proto.constructor.name + " : [" + nonImpl.join(',') + "]");
    }
    // Mark the class as processed
    Reflect.defineMetadata(KEY_REGULAR_ENFORCED, true, proto);
}
//# sourceMappingURL=AbstractClassAPI.js.map