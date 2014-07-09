var $ = require('lodash')
var Promise = require('bluebird')

/*
 * ========
 * promisify mongoose via Bluebird
 * ========
 *
 * mongoose basics
 * models extends from mongoose.Model
 * mongoose.models.ModelName equals mongoose.model('ModelName')
 * ModelName.schema equals mongoose.modelSchemas.ModelName
 * static methods should be extended on mongoose.Model with a dynamic context
 * instance methods should be extended on mongoose.Model.prototype
 * */

exports.promisifyAll = function(mongoose, suffix){
	var Schemas = mongoose.modelSchemas, Models = mongoose.models
	if(Object.keys(Models).length < 1){
		throw new Error('Promisify Error:No models found')
	}

	suffix = suffix || 'Async'
	var  Model = mongoose.Model

	// promisify static methods by appending a suffix, default `Async`
	var modelStaticsList = [
		'aggregate', 'count', 'create', 'distinct', 'ensureIndexes',
		'find', 'findById', 'findByIdAndRemove', 'findByIdAndUpdate',
		'findOne', 'findOneAndRemove', 'findOneAndUpdate',
		'geoNear', 'geoSearch', 'mapReduce', 'populate', 'remove', 'update'
	]
	$.each(modelStaticsList, function(method){
		Model[method + suffix] = function(){
			// using this to ref the target child class, do not use Model
			return Promise.promisify(Model[method]).apply(this, arguments)
		}
	})

	//promisify custom static methods from schema.statics
	$.each(Schemas, function(schema, schemaName){
		$.each(schema.statics, function(fn, methodName){
			var model = Models[schemaName]
			model[methodName + suffix] = function(){
				return Promise.promisify(model[methodName]).apply(this, arguments)
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
			//from Document
			'update', 'validate', 'populate',
			'remove', 'save'
		]
	}
	$.forIn(instanceSource, function(methods, className){
		var cls = mongoose[className], prototype = cls.prototype
		var isDocument = className === 'Model'

		$.each(methods, function(i){
			var methodName = i + suffix
			prototype[methodName] = function(){
				/*
				 * mongoose internal use hooks to add pre and post handlers,
				 * you can not use Promise.promisify directly
				 * but the traditional way always works.
				 * */
				if(isDocument) {
					var doc = this, args = $.toArray(arguments)
					return new Promise(function(resolve, reject){
						args.push(function(err){
							if(err) return reject(err)
							var receivedArgs = $.toArray(arguments)
							receivedArgs.shift()
							//send the arguments as an array
							resolve(receivedArgs)
						})
						//magic invocation
						doc[i].apply(doc, args)
					})
				}
				//for simple class
				return Promise.promisify(prototype[i]).apply(this, arguments)
			}
		})
	})
}