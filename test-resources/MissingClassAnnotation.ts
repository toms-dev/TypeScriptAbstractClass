
import API = require('../lib/AbstractClassAPI');

@API.Abstract
export class Abstract1 {

	@API.AbstractMethod
	public doIt() {}

	public anoterMethod() {}

}

export class Class1 extends Abstract1 {

	public doIt() {
	}

}

export class Class2 extends Abstract1 {
	// does not implement anything!

	public derp() {}

}