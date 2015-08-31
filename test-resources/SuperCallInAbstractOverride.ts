
import API = require('../index');

@API.Abstract
class Abstract1 {

	@API.AbstractMethod
	public doIt() {}

	public anotherMethod() {}

}

@API.Class
class Class1 extends Abstract1 {

	public doIt() {
		super.doIt();
	}

}