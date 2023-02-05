import {MongoClient, ObjectId} from 'mongodb';
import {utils as u} from './utils.js';

const connectionUrl = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(connectionUrl);
const dbName = 'task-manager';

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    u.log('Connected successfully to server');
    const db = client.db(dbName);
    const users = db.collection('users'),
        task = db.collection('task');

    // ------------------------------------insert
    const insertedUser = await users.insertOne({name: 'John', age: 40});
    // insert many
    // await users.insertMany([{name: 'John', age: 40}, {name: 'Bob', age: 44}]);

    // ------------------------------------insertMany

    // await task.insertMany([
    //     {description: 'ToDo 1', completed: false},
    //     {description: 'ToDo 2', completed: false},
    //     {description: 'ToDo 3', completed: false}
    // ]);

    // ------------------------------------with use ObjectId()
    // await users.insertOne({_id: new ObjectId(), name: 'Johny', age: 41});

    // ------------------------------------findOne
    // const userBob = await users.findOne({name: 'Bob'});
    // u.log('userBob', userBob);
    //
    // const userJohn = await users.findOne({_id: new ObjectId('63a880cd59e3bc24d80f9366')});
    // u.log('userJohn', userJohn);

    // ------------------------------------findOne task by Id
    // const lastTask = await task.findOne({_id: new ObjectId('63a883f10d9a78f18267ac5e')});
    // u.log('lastTask', lastTask);

    // ------------------------------------find (multiple)
    // const usersAge40 = await users.find({age: 40}),
    //     usersAge40Arr = await usersAge40.toArray();
    // u.log('usersAge40Arr', usersAge40Arr);

    // ------------------------------------find not completed task
    // const allTaskNotComplete = await task.find({completed: false}),
    //     allTaskNotCompleteArr = await allTaskNotComplete.toArray();
    // u.log('allTaskNotCompleteArr', allTaskNotCompleteArr);

    // ------------------------------------count
    // const countUserAge40 = await users.count({age: 40});
    // u.log('countUserAge40', countUserAge40);

    // ------------------------------------updateOne
    // (св-во age сохраняется несмотря на то что мы обновляем только name)
   //  const updateUser = await users.updateOne({_id: new ObjectId('63a86e28cdfc7bb118c41392')}, {
   //      $set: {
   //          name: 'Kostya'
   //      }
   //  });
   // await users.updateOne({_id: new ObjectId('63a86e28cdfc7bb118c41392')}, {
   //      $inc: {
   //          age: 2
   //      }
   //  });
   //  u.log('updateUser', updateUser);

    // ------------------------------------updateMany
    // const {matchedCount: matchedCountAll, modifiedCount: modifiedCountAll} = await task.updateMany({
    //     completed: false
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // });
    // u.log('matchedCountAll', matchedCountAll);
    // u.log('modifiedCountAll', modifiedCountAll);

    // ------------------------------------deleteMany
    // const deletedUsers = await users.deleteMany({age: 40});
    // u.log(deletedUsers);

    // ------------------------------------deleteOne
    // const deletedUser = await users.deleteOne({age: 40});
    // u.log(deletedUser);


    return 'Done.';
}

main()
    .then(u.log)
    .catch(u.error)
    .finally(() => client.close());