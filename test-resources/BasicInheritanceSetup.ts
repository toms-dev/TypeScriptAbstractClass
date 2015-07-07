
import API = require('../lib/AbstractClassAPI');

@API.Abstract
export class Abstract1 {

	@API.AbstractMethod
	public doIt() {}

	public anoterMethod() {}

}

@API.Class
export class Class1 extends Abstract1 {

	public doIt() {
		return super.doIt();
	}

}