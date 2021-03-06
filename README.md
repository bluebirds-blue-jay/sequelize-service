# SequelizeService

[![npm](https://img.shields.io/npm/v/@bluejay/sequelize-service.svg?style=flat-square)](https://www.npmjs.com/package/@bluejay/sequelize-service)
 [![npm](https://img.shields.io/npm/dm/@bluejay/sequelize-service.svg?style=flat-square)](https://www.npmjs.com/package/@bluejay/sequelize-service)
[![npm](https://img.shields.io/npm/l/@bluejay/sequelize-service.svg?style=flat-square)](https://www.npmjs.com/package/@bluejay/sequelize-service)

Sequelize model based service, exposes basic CRUD methods, pub/sub mechanisms, computed properties through decorations.

## Requirements

- `node >= 8.6`, tested with:
  - `node@8.6.0`
  - `node@12.8.1`
- `typescript >= 4.0`, tested with:
  - `typescript@4.0.2`
- `inversify >= 4.13`

## Installation

`npm i inversify reflect-metadata @bluejay/sequelize-service`


## Usage

### Creating a SequelizeService

The only required dependency is a Sequelize model.

  - `TUserWriteProperties` is an interface describing a user's properties used during write and update operations. It is recommended to require properties that are required to create the object and leaving the others as optional.
  - `TUserReadProperties` is an interface describing a user's properties used during read operations. It is recommend to define as readonly.
  - `TUserComputedProperties` is an interface describing the possible computed properties for a user object.  
  - `UserModel` is the User Sequelize model.

#### Manually

```typescript
const userService = new SequelizeService<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>(UserModel);
```

#### Using inversify

```typescript
// TUserReadProperties is the most inclusive interface, describing all the fields from the User schema
@injectable()
export class UserService extends SequelizeService<TUserWriteProperties, TUserReadProperties, TUserComputedProperties> {
  @inject(ID.UserModel) protected model: Sequelize.Model<TUserReadProperties, TUserReadProperties>;
}

// ---

// Make sure to declare the service as a singleton to ensure events are caught by all subscribers
container.bind<ISequelizeService<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>>(ID.UserService).to(UserService).inSingletonScope();
``` 

### Sessions

All hooks and many methods receive a `Session` object which provides various handful methods to deal with a set of data, in a particular context.

A `Session` inherits from [Collection](https://github.com/bluebirds-blue-jay/collection), so you can manipulate/iterate data asynchronous without the need of external libraries.

Sessions also expose various methods related to the type of query you're currently dealing with. For example during an update:

```typescript
class UserService extends SequelizeService<TUserWriteProperties, TUserReadProperties, TUserComputedProperties> {
  // ...
  protected async beforeUpdate(session: UpdateSession<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) {
    session.getOption('transaction'); // Get the transaction under which this update is being performed
    session.hasFilter('email'); // Whether os not this update is filtered by email
    session.getValue('email'); // Get the update value of `email`, if present
    
    await session.fetch(); // Performs a select
    
    await session.ensureIdentified(); // Make sure all objects corresponding to the filters have their primary key set
    
    await session.ensureProperties({ select: ['email', 'age'] }); // Only performs a SELECT if not all objects have their age and email set
    
    // Run a callback for each user, in parallel
    await session.forEachParallel(async user => {
      
    });
    
    // Run a callback for each user, in series
    await session.forEachSeries(async user => {
      
    });
    
    // Get all the users IDs
    const ids = session.mapByProperty('id');
  }
}
```

You might notice that this documentation never refers to particular instances, this is because this entire module is based on sessions, which in turn encourage you to think all queries as bulk operations, and therefore optimize for multiple objects.

### Querying

All methods returning multiple objects return a [Collection](https://github.com/bluebirds-blue-jay/collection). Methods returning a single return an unwrapped object.

#### Creating objects

##### Creating a single object

```typescript
const user = await userService.create({ email: 'foo@example.com', password: 'abcdefg' });
console.log(user.email); // foo@example.com
```

##### Creating multiple objects

```typescript
const users = await userService.createMany([{ email: 'foo@example.com', password: 'abcdefg' } /*, ...*/ ]);
users.forEach(user => console.log(user.email));
```

#### Finding objects

```typescript
// Find multiple users
const users = await userService.find({ email: { in: ['foo@example.com', 'foo@bar.com'] } });

// Find a single user by its primary key
const user = await userService.findByPrimaryKey(1);

// Find multiple users by their primary key
const users = await userService.findByPrimaryKeys([1, 2]);
```

#### Updating objects

```typescript
// Change the user email to another value
await userService.update({ email: 'foo@example.comn' }, { email: 'foo@bar.com' });

// Target a user by primary key
await userService.updateByPrimaryKey(1, {  email: 'foo@bar.com' });
```

#### Upserting an obejct

*Caution:* This methods will lock the "candidate" row, and perform either a `create` or an `update` depending on if a candidate was found.

*Note:* For consistency, the created/updated row is always returned, meaning that we perform a SELECT after the update, if necessary.

This method uses a more MongoDB like syntax, allowing you to pass complex filters as part of the matching criteria.

```typescript
// Make sure a user older than 21 exists
await userService.replaceOne({ email: 'foo@example.com', age: { gte: 21 } }, { email: 'foo@example.com', age: 21 });
```

#### Deleting objects

```typescript
// Remove all users younger than 21 
await userService.delete({ age: { lt: 21 } });
```

#### Counting objects

```typescript
const count = await userService.count({ age: { lt: 30 } });
```

### Working with transactions

*Note:* All writing methods automatically create a transaction, which encapsulates both the hooks and the model call itself, meaning that if an `afterCreate` hooks fails, for example, the entire creation will be rolled back,.

#### Creating a transaction

Within your service, the `protected` `transaction()` method allows you to create a new transaction.

```typescript
return await this.transaction({}, async transaction => {
  // Your code here
});
```

#### Ensuring a transaction

There are times when you want to make sure you're running under a transaction, but not necessarily create a new one, if, for example, your current method's caller already created one.

The `transaction()` method takes an `options` parameter, which may contain a `transaction` property, in which the transaction will be reused.

```typescript
return await this.transaction({}, async transaction => {
  return await this.transaction({ transaction }, newTransaction => {
    console.log(newTransaction === transaction); // true
  });
});
```

#### Passing transactions to methods

All query methods accept an optional `transaction`.

```typescript
await userService.find({}, { transaction });
await userService.create({ email: 'foo@example.com', password: 'abcdefg' }, { transaction });
```

### Working with hooks

Hooks are a convenient way to validate and transform you data.

Hooks are ran for all write queries, before and after the query.

```typescript
class UserService extends SequelizeService<TUserWriteProperties, TUserReadProperties, TUserComputedProperties> {
  /// ...
  
  protected async beforeCreate(session: CreateSession<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) {
    await session.forEachParallel(async user => {
      // Your code here
    });
  }
}
```


### Working with events

### Computed properties

Computed properties allow you to decorate objects with properties that are not stored in your DB.

Computed properties are instances of the abstract `ComputedProperty` class and must implement their `transform` method, which takes a `Session` as an argument.

```typescript
class UserAge extends ComputedProperty<TUserWriteProperties, TUserReadProperties, TUserComputedProperties, number> { // "age" is a number
  public async transform(session: Session<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) { // "transform" is abstract and must be implemented
    session.forEach(user => {
      user.age = moment.duration(moment().diff(user.date_of_birth)).get('years'); // We set "age" on each object of the session, based on the date of birth
    });
  }
}
```

```typescript
class UserIsAdult extends ComputedProperty<TUserWriteProperties, TUserReadProperties, TUserComputedProperties, boolean> {
  public async transform(session: Session<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) {
    await session.ensureProperties({ compute: ['age'] }); // We make sure the age is set
    session.forEach(user => {
      user.isAdult = user.age >= 21
    });
  }
}
```

To make your service aware of the computed properties, you need to create a manager:

```typescript
class UserComputedPropertiesManager extends UserComputedPropertiesManager<TUserWriteProperties, TUserReadProperties, TUserComputedProperties> {
  protected map() {
    return {
      age: new UserAge(),
      isAdult: { property: new UserIsAdult(), dependencies: ['age'] } // We make sure that the age is fetched before
    };
  }
}
```

And finally you can set the manager on your service:

```typescript
class UserService extends SequelizeService<TUserWriteProperties, TUserReadProperties, TUserComputedProperties> {
  protected computedPropertiesManager = new UserComputedPropertiesManager();
  
  // ...
}
```

You can now request `age` and `isAdult` to be computed using the `compute` option:

```typescript
const myUser = await userService.findByPrimaryKey(1, { compute: ['age', 'isAdult'] });
```


## Documentation

See [Github Pages](https://bluebirds-blue-jay.github.io/sequelize-service/).
