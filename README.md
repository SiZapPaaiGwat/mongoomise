# mongoomise

------

promisify mongoose by any promise library, current support list is bluebird, q, when, RSVP.

## mongoose basics

understanding some mongoose basics to help you implement a better api

> * models extends from mongoose.Model
> * mongoose.models.ModelName equals to mongoose.model('ModelName')
> * ModelName.schema equals to mongoose.modelSchemas.ModelName
> * static methods should be extended on mongoose.Model with a dynamic context
> * instance methods should be extended on mongoose.Model.prototype
> * custom model static methods are stored in MyModel.schema.statics 

## Usage

```javascript

var bluebird = require('bluebird')
var Q = require('q')
var when = require('when')
var RSVP = require('rsvp')
var mongoose = require('mongoose')

require('mongoomise').promisifyAll(mongoose, Q)

var Feed = mongoose.model('Feed')

// static method from Model
Feed.countAsync().then(function(total){
	console.log('static method from Model', total)
})

// instance method from Query
Feed.find().countAsync().then(function(total){
	console.log('instance method from Query', total)
})

// instance method from Model
Feed.findOne().execAsync().then(function(feed){
	feed.text = 'oops'
	return feed.saveAsync()
}).then(function(results){
	console.log(results)
})

// custom static method
Feed.testAsync().then(function(output){
	console.log('custom static method', output)
})

 ```
 
invoke `mongoomise.promisifyAll ` just one time after all models are loaded,
then you can enjoy all the utilities in everywhere.

## Notes

* Do I have to change my existing  mongoose related code? No, just follow your old style.
* Does hooks like Schema.pre work as usual? Yes. some useful discussion [here](https://github.com/yamadapc/mongoose-bluebird-utils/issues/1)
* Does it support custom model static method? Yes!
* mongoomise.promiseAll should be invoked `after` all models are `loaded`

## To be done

* more tests
