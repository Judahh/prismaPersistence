// file deepcode ignore no-any: any needed
import {
  Handler,
  Operation,
  Event,
  MongoDB,
  PersistenceInfo,
} from 'flexiblepersistence';
import TestDAO from './testDAO';
import ObjectDAO from './objectDAO';

import { DAODB, Utils } from '../../source';
import { Journaly, SubjectObserver } from 'journaly';
import { eventInfo, readInfo } from './databaseInfos';
let read;
let write;
test('add and read array and find object', async (done) => {
  const journaly = Journaly.newJournaly() as SubjectObserver<any>;
  const eventDatabase = new MongoDB(new PersistenceInfo(eventInfo, journaly));
  const database = new PersistenceInfo(readInfo, journaly);
  write = eventDatabase;
  read = new DAODB(database);
  const pool = read.getPool();
  await Utils.init(pool);
  new TestDAO({
    pool,
    journaly,
  });
  new ObjectDAO({
    pool,
    journaly,
  });
  const handler = new Handler(write, read);
  await handler.getWrite().clear('events');
  const obj = {};
  obj['test'] = 'test';
  try {
    // console.log('TEST00');
    const persistencePromise = await handler.addEvent(
      new Event({ operation: Operation.create, name: 'Object', content: obj })
    );

    // console.log('TEST00:', persistencePromise);

    const obj0 = {
      id: persistencePromise.receivedItem.id,
      test: 'test',
      testnumber: null,
    };

    expect(persistencePromise.receivedItem).toStrictEqual(obj0);

    // console.log('TEST02');

    // const persistencePromise1 = await handler.readArray('Object', {});
    const persistencePromise1 = await handler.addEvent(
      new Event({ operation: Operation.read, name: 'Object', single: false })
    );
    // console.log('TEST02', persistencePromise1);
    expect(persistencePromise1.receivedItem).toStrictEqual([obj0]);
    expect(persistencePromise1.selectedItem).toStrictEqual(undefined);
    expect(persistencePromise1.sentItem).toStrictEqual(undefined);

    const persistencePromise10 = await handler.addEvent(
      new Event({ operation: Operation.create, name: 'Object', content: obj })
    );

    // console.log('TEST02:', persistencePromise10);
    const obj1 = {
      id: persistencePromise10.receivedItem.id,
      test: 'test',
      testnumber: null,
    };

    expect(persistencePromise10.receivedItem).toStrictEqual(obj1);

    const all2 = {
      receivedItem: [obj0, obj1],
      result: [obj0, obj1],
      selectedItem: {},
      sentItem: undefined,
    };

    const persistencePromise101 = await handler.readArray('Object', {});

    // console.log('TEST03:', persistencePromise101);
    expect(persistencePromise101).toStrictEqual(all2);
    expect(persistencePromise101.selectedItem).toStrictEqual({});
    expect(persistencePromise101.sentItem).toStrictEqual(undefined);

    const persistencePromise11 = await handler.addEvent(
      new Event({
        operation: Operation.read,
        name: 'Object',
        single: false,
        selection: { test: 'test' },
      })
    );
    // console.log('TEST04', persistencePromise11);
    expect(persistencePromise11.receivedItem).toStrictEqual([obj0, obj1]);
    expect(persistencePromise11.selectedItem).toStrictEqual({ test: 'test' });
    expect(persistencePromise11.sentItem).toStrictEqual(undefined);

    // console.log('TEST04');

    const persistencePromise2 = await handler.readItem('Object', {});

    // console.log('TEST04:', persistencePromise2);
    expect(persistencePromise2.receivedItem).toStrictEqual({
      id: persistencePromise2.receivedItem.id,
      test: 'test',
      testnumber: null,
    });
    expect(persistencePromise2.selectedItem).toStrictEqual({});
    expect(persistencePromise2.sentItem).toStrictEqual(undefined);

    // console.log('TEST033');

    const persistencePromise20 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        selection: { id: persistencePromise2.receivedItem.id },
      })
    );

    expect(persistencePromise20).toStrictEqual({
      receivedItem: true,
      result: true,
      selectedItem: { id: persistencePromise2.receivedItem.id },
      sentItem: undefined,
    });

    const persistencePromise22 = await handler.readArray('Object', {});

    // console.log('TEST03:', persistencePromise22);
    expect(persistencePromise22.receivedItem).toStrictEqual([
      {
        id: persistencePromise22.receivedItem[0].id,
        test: 'test',
        testnumber: null,
      },
    ]);
    expect(persistencePromise22.selectedItem).toStrictEqual({});
    expect(persistencePromise22.sentItem).toStrictEqual(undefined);

    // console.log('TEST04');
    const persistencePromise3 = await handler.addEvent(
      new Event({
        operation: Operation.update,
        name: 'Object',
        selection: { test: 'test' },
        content: { test: 'bob' },
      })
    );
    // console.log('TEST04:', persistencePromise3);
    expect(persistencePromise3.receivedItem).toStrictEqual({
      id: persistencePromise22.receivedItem[0].id,
      test: 'bob',
      testnumber: null,
    });
    expect(persistencePromise3.selectedItem).toStrictEqual({
      test: 'test',
    });
    expect(persistencePromise3.sentItem).toStrictEqual({
      test: 'bob',
    });

    // console.log('TEST05');

    // console.log(await read.query('UPDATE object SET test = \'bob\', testNumber = \'10\' WHERE (test = \'test\')', [], {}));

    const persistencePromise4 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: false,
        selection: { test: 'bob' },
      })
    );
    // console.log('TEST05:', persistencePromise4);

    expect(persistencePromise4.receivedItem).toStrictEqual(1);
    expect(persistencePromise4.selectedItem).toStrictEqual({ test: 'bob' });
    expect(persistencePromise4.sentItem).toStrictEqual(undefined);

    // console.log('TEST06');
    const persistencePromise5 = await handler.readArray('Object', {});

    expect(persistencePromise5.receivedItem.length).toBe(0);
    expect(persistencePromise5.receivedItem).toStrictEqual([]);
    expect(persistencePromise5.selectedItem).toStrictEqual({});
    expect(persistencePromise5.sentItem).toStrictEqual(undefined);

    // console.log('TEST07');
    const persistencePromise6 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: false,
      })
    );
    expect(persistencePromise6.receivedItem).toStrictEqual(0);
    expect(persistencePromise6.selectedItem).toStrictEqual(undefined);
    expect(persistencePromise6.sentItem).toStrictEqual(undefined);
  } catch (error) {
    console.error(error);
    await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: false,
      })
    );
    // const persistencePromise7 = await handler.readArray('Object', {});
    // expect(persistencePromise7.result.rowCount).toBe(0);
    await handler.getWrite().clear('events');
    await write.close();
    await Utils.dropTables(pool);
    expect(error).toBe(null);
    done();
  }
  await handler.addEvent(
    new Event({ operation: Operation.delete, name: 'Object' })
  );
  await handler.getWrite().clear('events');
  await write.close();
  await Utils.dropTables(pool);
  done();
});

test('add array and read elements, update and delete object', async (done) => {
  const journaly = Journaly.newJournaly() as SubjectObserver<any>;
  const eventDatabase = new MongoDB(new PersistenceInfo(eventInfo, journaly));
  const database = new PersistenceInfo(readInfo, journaly);
  write = eventDatabase;
  read = new DAODB(database);
  const pool = read.getPool();
  await Utils.init(pool);
  new TestDAO({
    pool,
    journaly,
  });
  new ObjectDAO({
    pool,
    journaly,
  });
  const handler = new Handler(write, read);
  const obj00 = {};
  obj00['test'] = 'test';
  const obj01 = {};
  obj01['test'] = 'test2';
  try {
    // console.log('TEST00');
    const persistencePromise = await handler.addEvent(
      new Event({
        operation: Operation.create,
        name: 'Object',
        single: false,
        content: [obj00, obj01],
      })
    );

    // console.log('TEST00:', persistencePromise);

    const obj0 = {
      ...obj00,
      id: persistencePromise.receivedItem[0].id,
      testnumber: null,
    };
    const obj1 = {
      ...obj01,
      id: persistencePromise.receivedItem[1].id,
      testnumber: null,
    };

    expect(persistencePromise.receivedItem).toStrictEqual([obj0, obj1]);

    // console.log('TEST07');
    const persistencePromise1 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: true,
        selection: obj00,
      })
    );
    expect(persistencePromise1.receivedItem).toStrictEqual(true);
    expect(persistencePromise1.selectedItem).toStrictEqual(obj00);
    expect(persistencePromise1.sentItem).toStrictEqual(undefined);

    const persistencePromise2 = await handler.addEvent(
      new Event({
        operation: Operation.read,
        name: 'Object',
        single: true,
        selection: obj01,
      })
    );
    expect(persistencePromise2.receivedItem).toStrictEqual(obj1);
    expect(persistencePromise2.selectedItem).toStrictEqual(obj01);
    expect(persistencePromise2.sentItem).toStrictEqual(undefined);

    const obj02 = { ...obj01, test: 'Object' };
    const persistencePromise3 = await handler.addEvent(
      new Event({
        operation: Operation.update,
        name: 'Object',
        single: false,
        selection: obj01,
        content: { test: obj02.test },
      })
    );
    const obj3 = { ...obj1, test: obj02.test };
    expect(persistencePromise3.receivedItem).toStrictEqual(obj3);
    expect(persistencePromise3.selectedItem).toStrictEqual(obj01);
    expect(persistencePromise3.sentItem).toStrictEqual({ test: obj02.test });

    const persistencePromise4 = await handler.addEvent(
      new Event({
        operation: Operation.update,
        name: 'Object',
        single: true,
        selection: { id: obj3.id },
        content: obj01,
      })
    );

    expect(persistencePromise4.receivedItem).toStrictEqual(obj1);
    expect(persistencePromise4.selectedItem).toStrictEqual({ id: obj3.id });
    expect(persistencePromise4.sentItem).toStrictEqual(obj01);

    const persistencePromise5 = await handler.addEvent(
      new Event({
        operation: Operation.read,
        name: 'Object',
        single: true,
        selection: { id: obj1.id },
      })
    );

    expect(persistencePromise5.receivedItem).toStrictEqual(obj1);
    expect(persistencePromise5.selectedItem).toStrictEqual({ id: obj1.id });
    expect(persistencePromise5.sentItem).toStrictEqual(undefined);
  } catch (error) {
    console.error(error);
    await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: false,
      })
    );
    // const persistencePromise7 = await handler.readArray('Object', {});
    // expect(persistencePromise7.result.rowCount).toBe(0);
    await handler.getWrite().clear('events');
    await write.close();
    await Utils.end(pool);
    expect(error).toBe(null);
    done();
  }
  await handler.addEvent(
    new Event({ operation: Operation.delete, name: 'Object' })
  );
  await handler.getWrite().clear('events');
  await write.close();
  await Utils.end(pool);
  done();
});
