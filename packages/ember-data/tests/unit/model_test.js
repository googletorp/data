var get = Ember.get, set = Ember.set, getPath = Ember.getPath;

var Person, store, array;

module("DS.Model", {
  setup: function() {
    store = DS.Store.create();

    Person = DS.Model.extend({
      name: DS.attr('string'),
      isDrugAddict: DS.attr('boolean')
    });
  },

  teardown: function() {
    Person = null;
    store = null;
  }
});

test("can have a property set on it", function() {
  var record = store.createRecord(Person);
  set(record, 'name', 'bar');

  equal(get(record, 'name'), 'bar', "property was set on the record");
});

test("setting a property on a record that has not changed does not cause it to become dirty", function() {
  store.load(Person, { id: 1, name: "Peter", isDrugAddict: true });
  var person = store.find(Person, 1);

  equal(person.get('isDirty'), false, "precond - person record should not be dirty");
  person.set('name', "Peter");
  person.set('isDrugAddict', true);
  equal(person.get('isDirty'), false, "record does not become dirty after setting property to old value");
});

test("a record reports its unique id via the `id` property", function() {
  store.load(Person, { id: 1 });

  var record = store.find(Person, 1);
  equal(get(record, 'id'), 1, "reports id as id by default");

  var PersonWithPrimaryKey = DS.Model.extend({
    primaryKey: 'foobar'
  });

  store.load(PersonWithPrimaryKey, { id: 1, foobar: 2 });
  record = store.find(PersonWithPrimaryKey, 2);

  equal(get(record, 'id'), 2, "reports id as foobar when primaryKey is set");
});

test("retrieving properties should return the same value as they would if they were not in the data hash if the record is not loaded", function() {
  var store = DS.Store.create({
    adapter: DS.Adapter.create({ find: Ember.K })
  });

  // TODO :
  // Investigate why this test fail with DS.attr `name` and jshint because of this :
  // if (typeof String.prototype.name !== 'function') {
  //   String.prototype.name = function () {
  //     if (ix.test(this)) {
  //         return this;
  //     }
  //     if (nx.test(this)) {
  //         return '"' + this.replace(nxg, function (a) {
  //             var c = escapes[a];
  //             if (c) {
  //                 return c;
  //             }
  //             return '\\u' + ('0000' + a.charCodeAt().toString(16)).slice(-4);
  //         }) + '"';
  //     }
  //     return '"' + this + '"';
  //   };
  // }

  var Person = DS.Model.extend({
    firstName: DS.attr('string')
  });

  var record = store.find(Person, 1);

  strictEqual(get(record, 'firstName'), null, "returns null value");
});

test("it should cache attributes", function() {
  var store = DS.Store.create();

  var Post = DS.Model.extend({
    updatedAt: DS.attr('date')
  });

  var dateString = "Sat, 31 Dec 2011 00:08:16 GMT";
  var date = new Date(dateString);

  store.load(Post, { id: 1 });

  var record = store.find(Post, 1);

  record.set('updatedAt', date);
  deepEqual(date, get(record, 'updatedAt'), "setting a date returns the same date");
  strictEqual(get(record, 'updatedAt'), get(record, 'updatedAt'), "second get still returns the same object");
});

module("DS.Model updating", {
  setup: function() {
    array = [{ id: 1, name: "Scumbag Dale" }, { id: 2, name: "Scumbag Katz" }, { id: 3, name: "Scumbag Bryn" }];
    Person = DS.Model.extend({ name: DS.attr('string') });
    store = DS.Store.create();
    store.loadMany(Person, array);
  },
  teardown: function() {
    Person = null;
    store = null;
    array = null;
  }
});

test("a DS.Model can update its attributes", function() {
  var person = store.find(Person, 2);

  set(person, 'name', "Brohuda Katz");
  equal(get(person, 'name'), "Brohuda Katz", "setting took hold");
});

test("a DS.Model can have a defaultValue", function() {
  var Tag = DS.Model.extend({
    name: DS.attr('string', { defaultValue: "unknown" })
  });

  var tag = Tag.createRecord();

  equal(get(tag, 'name'), "unknown", "the default value is found");

  set(tag, 'name', null);

  equal(get(tag, 'name'), null, "null doesn't shadow defaultValue");
});

