

class MyError {

	public message: string;

	constructor(message:string) {
		this.message = message;
	}
}

export class MethodNotImplementedException extends MyError {

	public list: string[];

	constructor(prototype, list: string[]) {
		super("Methods not implemented in " + prototype.constructor.name + " : [" + list.join(',') + "]");
		this.list = list;
	}

}

export class CantInstantiateAbstractClass extends MyError {

	public prototype;

	constructor(prototype) {
		super("Can't instantiate abstract class "+prototype.constructor.name+" !");
		this.prototype = prototype;
	}

}