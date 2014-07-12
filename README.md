# mongoomise

promisify mongoose by any promise library
 
## Support list

* [bluebird](https://github.com/petkaantonov/bluebird)
* [Q](https://github.com/kriskowal/q)
* [when.js](https://github.com/cujojs/when)
* [RSVP](https://github.com/tildeio/rsvp.js)
* [es6-promise](https://github.com/jakearchibald/es6-promise)

## mongoose basics

> * your models extends from mongoose.Model
> * mongoose.models.ModelName equals to mongoose.model('ModelName')
> * ModelName.schema equals to mongoose.modelSchemas.ModelName
> * static methods should be extended on mongoose.Model with a dynamic context
> * instance methods should be extended on mongoose.Model.prototype
> * custom model static methods are stored in MyModel.schema.statics 

## Usage

```javascript

var mongoose = require('mongoose')

// load your models first
//...

// choose your fav library
require('mongoomise').promisifyAll(mongoose, require('bluebird'))
// require('mongoomise').promisifyAll(mongoose, require('q'))
// require('mongoomise').promisifyAll(mongoose, require('rsvp'))
// require('mongoomise').promisifyAll(mongoose, require('when'))

// start flying
User.findOneAsync().then(function(user){
	user.pv += 1
	return user.saveAsync()
}).then(function(results){
	console.log(results)
})

 ```
 
## Notes

* Do I have to change my existing  mongoose related code? No, just follow your old style.
* Does hooks like Schema.pre work as usual? Yes. some useful discussion [here](https://github.com/yamadapc/mongoose-bluebird-utils/issues/1)
* Does it support custom model static method? Yes!
* mongoomise.promisifyAll should be invoked `after` all models are `loaded`

## Test

```bash

mocha ./test/mocha

```

## Benchmark

```bash

node benchmark/index

```
the benchmark contains:

> * bluebird - using bluebird.promisifyAll(mongoose)
> * mongoomise/bluebird - using mongoomise with bluebird
> * mongoomise/Q - using mongoomise with Q
> * mongoomise/RSVP - using mongoomise with RSVP
> * mongoomise/when - using mongoomise with when.js
> * mongoomise/es6Promise - using mongoomise with es6-promise

in my MacAir, mongoomise/bluebird win the champion.



