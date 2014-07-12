var $ = require('lodash')

/*
 * get a promise from different promise provider
 * */
var getPromise = function(Promise, resolver){
	//bluebird
	if(Promise.promisifyAll) return new Promise(resolver)
	// when
	if(Promise.lift) return Promise.promise(resolver)
	//RSVP / Q / es6-promise
	if(Promise.Promise) return new Promise.Promise(resolver)
	throw new Error('not supported promise library')
}

/*
 * get a resolver from the original node style callback function
 * */
var getResolver = function(method, args, context){
	return function(resolve, reject){
		args.push(function (err) {
			if (err) return reject(err)
			var receivedArgs = $.toArray(arguments)
			// remove the first argument for error
			receivedArgs.shift()
			// passing the arguments
			resolve(receivedArgs.length>1?receivedArgs:receivedArgs[0])
		})
		// magic invocation
		method.apply(context, args)
	}
}

exports.promisifyAll = function(mongoose, Promise, suffix){
	var Schemas = mongoose.modelSchemas, Models = mongoose.models
	if(Object.keys(Models).length < 1){
		throw new Error('promisification should be done after all of your models are loaded')
	}

	if(!Promise){
		throw new Error('missing promise library')
	}

	suffix = suffix || 'Async'
	var  Model = mongoose.Model

	// promisify static methods by appending a suffix, default `Async`
	var modelStaticsList = [
		// aggregateAsync does not work, because Aggregate is not exposed by mongoose
		// 'aggregate',
		'count', 'create', 'distinct', 'ensureIndexes',
		'find', 'findById', 'findByIdAndRemove', 'findByIdAndUpdate',
		'findOne', 'findOneAndRemove', 'findOneAndUpdate',
		'geoNear', 'geoSearch', 'mapReduce', 'populate', 'remove', 'update'
	]
	$.each(modelStaticsList, function(methodName){
		Model[methodName + suffix] = function(){
			// using this to ref the target child class, do not use Model
			return getPromise(Promise, getResolver(Model[methodName], $.toArray(arguments), this))
		}
	})

	// promisify custom static methods from schema.statics
	$.each(Schemas, function(schema, schemaName){
		$.each(schema.statics, function(fn, methodName){
			var model = Models[schemaName]
			model[methodName + suffix] = function(){
				return getPromise(Promise, getResolver(model[methodName], $.toArray(arguments), this))
			}
		})
	})

	// promisify exposed mongoose classes instance methods
	var instanceSource = {
		Query: [
			'count', 'distinct', 'exec', 'find', 'findOne', 'findOneAndRemove',
			'findOneAndUpdate', 'remove', 'update'
		],
		Model: [
			'remove', 'save',
			// extended from Document
			'update', 'validate', 'populate'
		]
	}
	$.forIn(instanceSource, function(methods, className){
		var cls = mongoose[className], prototype = cls.prototype
		$.each(methods, function(i){
			var methodName = i + suffix
			prototype[methodName] = function(){
				/*
				 * mongoose internal use hooks to add pre and post handlers,
				 * traditional way always works.
				 * */
				return getPromise(Promise, getResolver(this[i], $.toArray(arguments), this))
			}
		})
	})
}