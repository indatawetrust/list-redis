[![Travis Build
Status](https://img.shields.io/travis/indatawetrust/list-redis-promise.svg)](https://travis-ci.org/indatawetrust/list-redis-promise)

# list-redis

  Create a list of hashes sorted by id backend by redis (useful to create queues with data).


## Installation

nodejs:

    $ npm install list-redis-promise
    

## API

```js
const list = require('list-redis-promise');
const queue = list('mylist');
```

  All functions take either an args Array plus optional callback because operations
  with redis are asynchronous.

### .push(hash)

  Create new hash in list and return its id.

```js
queue.push({
  name: 'bredele'
})
.then(id => {

})
.catch(err => {

})

```

### .get(id)

  Get hash by id.

```js
queue.get(12)
.then(hash => {

})
.catch(err => {

})
```

### .has(id)

  Return true if list set exists.

```js
queue.has(12)
.then(exists => {

})
.catch(err => {

})
```

### .del(id)

  Delete list set.

```js
queue.del(12)
.then(() => {

})
.catch(err => {

})
```

  Delete list set and hash:

 ```js
queue.del(12, true)
.then(() => {

})
.catch(err => {

})
``` 

### .move(id, list)

  Atomically removes the set of the list stored at source, and pushes the set to the list stored at destination.

```js
var other = list('otherList');
queue.move(12, other)
.then(exists => {

})
.catch(err => {

})
```
