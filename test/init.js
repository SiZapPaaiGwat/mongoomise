var mongoose = require('mongoose')
var should = require('should')
//load model
require('./feed')
mongoose.connect('mongodb://localhost/mongoomise')
var mongoomise = require('../src/main')
var Feed = mongoose.model('Feed')
var ObjectId = mongoose.Types.ObjectId

module.exports = function(Promise){
	mongoomise.promisifyAll(mongoose, Promise)

	var document = {_id: new ObjectId(), text:'mongoomise'}

	describe('.countAsync', function(){
		it('should return a number', function(done){
			Feed.countAsync().then(function(total){
				total.should.be.type('number')
				done()
			})
		})
	})

	describe('.createAsync', function(){
		it('should return a document with target id', function(done){
			Feed.createAsync(document).then(function(doc){
				doc._id.toString().should.equal(document._id.toString())
				// validate pre save hooks
				doc.create_time.should.be.instanceof(Date)
				done()
			})
		})
	})

	describe('.distinctAsync', function(){
		it('should return an array', function(done){
			Feed.distinctAsync('text').then(function(results){
				results.should.be.instanceof(Array)
				done()
			})
		})
	})

	describe('.findAsync', function(){
		it('should return documents', function(done){
			Feed.findAsync().then(function(results){
				results.should.be.instanceof(Array)
				done()
			})
		})
	})

	describe('.updateAsync', function(){
		it('should return affected number', function(done){
			Feed.updateAsync({}, {pid:document._id}).then(function(results){
				results.should.be.instanceof(Array)
				results[0].should.be.type('number')
				done()
			})
		})
	})

	describe('.populateAsync', function(){
		it('should populate a doc', function(done){
			Feed.populateAsync({pid:document._id}, {path:'pid'}).then(function(doc){
				doc.pid._id.toString().should.equal(document._id.toString())
				done()
			})
		})
	})

	describe('.customAsync', function(){
		it('should support invoke custom static method', function(done){
			var input = Math.random()
			Feed.customAsync(input).then(function(output){
				input.should.equal(output)
				done()
			})
		})
	})

	//handle error
	describe('error', function(){
		it('should throw an error', function(done){
			var promise = new Feed(document).saveAsync()
			if(promise.error){
				return promise.error(function(err){
					err.should.be.instanceof(Error)
					done()
				})
			}else if(promise.catch){
				return promise.catch(function(err){
					err.should.be.instanceof(Error)
					done()
				})
			}
		})
	})

}
