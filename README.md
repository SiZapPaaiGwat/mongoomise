# mongoomise

------

promisify mongoose via Bluebird.

well, you can simply switch to any other promise library

## mongoose basics

understanding some mongoose basics to help you implement a better api

> * models extends from mongoose.Model
> * mongoose.models.ModelName equals mongoose.model('ModelName')
> * ModelName.schema equals mongoose.modelSchemas.ModelName
> * static methods should be extended on mongoose.Model with a dynamic context
> * instance methods should be extended on mongoose.Model.prototype

## Initialization

```javascript
var mongoose = require('mongoose')
var mongoomise = require('mongoomise')
mongoomise.promisifyAll(mongoose)
 ```
invoke `mongoomise.promisifyAll ` just one time, on your first mongoose require.
then you can use the utilities in everywhere.

## Usage

```javascript
//static method
User.findOneAsync().then(function(user){
	user.updated_time = new Date
	//instance method
	return user.saveAsync()
}).then(function(results){
	//user, number affected
	console.log(results[0], results[1])
}).error(function(err){
	console.log(err)
})
```

## Notes

* Do i need to change my schema? No.
* Does Schema.pre and Schema.post work as usual? Yes, some discuss [here](https://github.com/yamadapc/mongoose-bluebird-utils/issues/1)
* Any side effects? Not sure, need more test case. 

