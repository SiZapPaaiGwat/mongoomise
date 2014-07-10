# mongoomise

------

promisify mongoose via Bluebird.

## mongoose basics

understanding some mongoose basics to help you implement a better api

> * models extends from mongoose.Model
> * mongoose.models.ModelName equals to mongoose.model('ModelName')
> * ModelName.schema equals to mongoose.modelSchemas.ModelName
> * static methods should be extended on mongoose.Model with a dynamic context
> * instance methods should be extended on mongoose.Model.prototype
> * custom model static methods are stored in MyModel.schema.statics 

## Initialization

```javascript

var mongoose = require('mongoose')
var mongoomise = require('mongoomise')
//load models first
mongoomise.promisifyAll(mongoose)

 ```
 
invoke `mongoomise.promisifyAll ` just one time after all models are loaded,
then you can enjoy all the utilities in everywhere.

## Usage

```javascript

UserSchema.pre('save', function(next){
	this.updated_time = new Date
})
//static method
User.findOneAsync().then(function(user){
	//instance method
      user.times += 1
	return user.saveAsync()
}).then(function(results){
	//user, number affected
	console.log(results[0], results[1])
}).error(function(err){
	console.log(err)
})

```

## Notes

* Do I have to change my existing  mongoose related code? No, just follow your old style.
* Does hooks like Schema.pre work as usual? Yes. some useful discussion [here](https://github.com/yamadapc/mongoose-bluebird-utils/issues/1)
* Does it support custom model static method? Yes!
* mongoomise.promiseAll should be invoked `after` all models are `loaded`

## To be done

* support different promise providers, such as Q, when.js, RSVP and so on
* more tests
