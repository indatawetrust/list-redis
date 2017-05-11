
/**
 * Module dependencies.
 * @api private
 */

var client = require('redis').createClient;


/**
 * Expose 'list'
 */

module.exports = List;


/**
 * List contructor.
 *
 * Initialize a list in redis with
 * the given name.
 *
 * Examples:
 *
 *   list = require('list')('mylist');
 *
 * @param {String} name
 * @api public
 */

function List(name) {
  if(!(this instanceof List)) return new List(name);
  // will need to pass options to set client
  this.client = client();
  this.name = name;
}



/**
 * Increment id key in order to always
 * get a uniq id.
 *
 * @return {Promise}
 * @api private
 */

List.prototype.incr = function() {

  return new Promise((resolve, reject) => {
    this.client.incr(this.name + ':id', function(err, res) {
      if(err) reject(err);
      resolve(res);
    });
  })

};


/**
 * Flatten object.
 *
 * @param  {Object} obj
 * @return {Array}
 * @api private
 */

function flatten(name, id, obj) {
  var arr = [name + ':' + id];
  for(var key in obj) {
    arr.push(key, obj[key]);
  }
  return arr;
}


/**
 * Is type of.
 *
 * @param  {Any}  data
 * @param  {String}  type
 * @return {Boolean}
 * @api private
 */

function is(data, type) {
  //NOTE: may be use library
  return (typeof data === type);
}


/**
 * Hash options into hash keys
 *
 * Hashes are identified with the
 * list name suffixed by ':' and
 * the id.
 *
 * @param  {Integer} id
 * @param  {Object} data
 * @api private
 */

List.prototype.hmset = function(id, data) {
  return new Promise((resolve, reject) => {
    if(is(data,'object')) {
      this.client.hmset(flatten(this.name, id, data), function(err) {
        if(err) reject(err);
        resolve();
      });
    }
  })
};


/**
 * Add set in list.
 *
 * @param {Integer}   id
 * @param {Function} cb
 * @api private
 */

List.prototype.add = function(id, cb) {
  return new Promise((resolve, reject) => {
    this.client.zadd(this.name, id, id, (err, res) => {
      if (err) reject(err)

      resolve(id)
    });
  })
};


/**
 * Push item into the list.
 *
 * Generate a uniq id and hashes options
 * if passed.
 *
 * Examples:
 *
 *  list.push(cb);
 *
 *  list.push({
 *    name: 'bredele'
 *  }, cb);
 *
 * @param {Object | Function} data
 * @param {Function} cb
 * @api public
 */

List.prototype.push = function(data) {
  return new Promise((resolve, reject) => {
    this.incr()
      .then(function(id) {
        // we don't care if hash didn't work
        this.hmset(id, data);
        this.add(id).then(resolve)
                    .catch(reject)
      }.bind(this))
  })
};


/**
 * Remove id from list.
 *
 * If second argument is true, it also
 * deletes hash options (if exists).
 *
 * Examples:
 *
 *   list.del(12, cb);
 *   list.del(13, true, cb);
 *
 * @param  {Integer}   id [description]
 * @param  {Function | Boolean} cb optional
 * @param  {Function} fn optional
 * @api public
 */

List.prototype.del = function(id, cb) {
  var erase = false;
  // NOTE: you could do better than that
  if(is(cb,'boolean')) {
    erase = cb;
  }

  return new Promise((resolve, reject) => {
    this.client.zrem(this.name, id, function(err, res) {
      if(erase) this.client.del(this.name + ':' + id);
      if (err) reject(err)
      resolve(res)
    }.bind(this));
  })
};


/**
 * Check if id exists in list.
 *
 * Examples:
 *
 *   list.has(12, function(err, bool) {
 *     // bool true if exists
 *   });
 *
 * @param  {Integer}   id
 * @param  {Function} cb
 * @api public
 */

List.prototype.has = function(id) {
  return new Promise((resolve, reject) => {
    this.client.zrank(this.name, id, function(err, res) {
      if (err) reject(err)
      resolve(res)
    });
  })
};


/**
 * Get options for given id.
 *
 * Hashes can exist even if id is
 * not in the list.
 *
 * Examples:
 *
 *  list.get(12, cb);
 *
 * @param  {Integer} id
 * @param  {Function} cb
 * @api public
 */

List.prototype.get = function(id) {
  //NOTE: should we check if in list?

  return new Promise((resolve, reject) => {
    this.client.hgetall(this.name + ':' + id, (err, results) => {
      if (err) reject(err)
      resolve(results)
    });
  })
};



List.prototype.hash = function() {
  //update options
};


/**
 * Move set into an other list.
 *
 * Atomically removes the set of the list
 * stored at source, and pushes the set to
 * the list stored at destination.
 *
 * Examples:
 *
 *   list.move(12, otherList, cb);
 *
 * @param  {Integer}   id
 * @param  {List}   list
 * @param  {Function} cb
 * @api public
 */

List.prototype.move = function(id, list, cb) {
  const _ = this

  return new Promise((resolve, reject) => {
    _.del(id).then(res => {
      if(res) list.add(id, cb)
      resolve(res)
    })
  })
};
