# mongoomise

------

promisify mongoose via Bluebird.

## mongoose basics

understanding some mongoose basics to help you implement a better api

> * models extends from mongoose.Model
> * mongoose.models.ModelName equals mongoose.model('ModelName')
> * ModelName.schema equals mongoose.modelSchemas.ModelName
> * static methods should be extended on mongoose.Model with a dynamic context
> * instance methods should be extended on mongoose.Model.prototype
> * custom model static methods are stored in Model.schema.statics 

## Initialization

```javascript
var mongoose = require('mongoose')
var mongoomise = require('mongoomise')
//load models first
mongoomise.promisifyAll(mongoose)
 ```
 
invoke `mongoomise.promisifyAll ` just one time, on your first mongoose require.
then you can enjoy the utilities in everywhere.

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

* Do I have to change my existing code? No, just follow your old style.
* Does Schema hooks like Schema.pre work as usual? Yes, totally the same.some useful discussion [here](https://github.com/yamadapc/mongoose-bluebird-utils/issues/1)
* Does it support custom model statics? Yes!

## To be done

* add different promise providers, such as Q, when.js, RSVP and so on
* more tests
