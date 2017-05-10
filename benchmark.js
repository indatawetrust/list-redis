var list = require('.');
var client = require('redis').createClient();

const queue = list('mylist');

const pushArr = [], getArr = [], hasArr = [], delArr = [];

console.time('total');
console.time('push');

for (let i = 0; i < 100000; i++)
  pushArr.push(
    queue.push({
      name: 'ahmet',
    })
  );

Promise.all(pushArr).then(resPush => {
  console.timeEnd('push');

  console.time('get');

  for (let i = 0; i < 100000; i++)
    getArr.push(queue.get(resPush[i]));

  Promise.all(getArr).then(res => {
    console.timeEnd('get');

    console.time('has');

    for (let i = 0; i < 100000; i++)
      hasArr.push(queue.has(resPush[i]));

    Promise.all(hasArr).then(res => {
      console.timeEnd('has');

      console.time('del');

      for (let i = 0; i < 100000; i++)
        delArr.push(queue.del(resPush[i]));

      Promise.all(delArr).then(res => {
        console.timeEnd('del');
        console.timeEnd('total');
      });
    });
  });
});
