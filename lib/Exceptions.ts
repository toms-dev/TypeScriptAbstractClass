class MyError {

	public message:string;

	constructor(message:string) {
		this.message = message;
	}

	public toString():string {
		return this.message;
	}
}

export class MethodNotImplementedException extends MyError {

	public list:string[];

	constructor(prototype, list:string[]) {
		super("Methods not implemented in " + prototype.constructor.name + " : [" + list.join(',') + "]");
		this.list = list;
	}

}

export class CantInstantiateAbstractClass extends MyError {

	public prototype;

	constructor(prototype) {
		super("Can't instantiate abstract class " + prototype.constructor.name + " !");
		this.prototype = prototype;
	}

}

export class MissingAnnotation extends MyError {

	public prototype;

	constructor(message:string) {
		super(message);
		this.prototype = null;
	}
}

export class AbstractMethodInRegularClass extends MyError {
	constructor(methods:string[]) {
		super("Abstract method in regular class: ["+methods.join(',')+"]");
	}
}

export class SuperCallToAbstractMethod extends MyError {
	constructor(method:string) {
		super(method+" is using a super call to an abstract method which is not defined!");
	}
}