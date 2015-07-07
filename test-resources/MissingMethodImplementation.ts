
import API = require('../lib/AbstractClassAPI');

@API.Abstract
class Abstract1 {

	@API.AbstractMethod
	public doIt() {}

	public anoterMethod() {}

}

@API.Class
class Class1 extends Abstract1 {

	// missing doIt here
	
}