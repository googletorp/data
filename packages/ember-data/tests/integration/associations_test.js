var get = Ember.get, set = Ember.set, getPath = Ember.getPath;

var store, adapter;
var Comment;

module("Association/adapter integration test", {
  setup: function() {
    adapter = DS.Adapter.create();

    store = DS.Store.create({
      isDefaultStore: true,
      adapter: adapter
    });

    Comment = DS.Model.extend();
    Comment.reopen({
      body: DS.attr('string'),
      comments: DS.hasMany(Comment),
      comment: DS.belongsTo(Comment)
    });
  },

  teardown: function() {
    store.destroy();
  }
});

test("an association has an isLoaded flag that indicates whether the ManyArray has finished loaded", function() {
  expect(7);

  var array;

  adapter.find = function(store, type, id) {
    setTimeout(async(function() {
      equal(array.get('isLoaded'), false, "Before loading, the array isn't isLoaded");
      store.load(type, { id: id });

      if (id === 3) {
        equal(array.get('isLoaded'), true, "After loading all records, the array isLoaded");
      } else {
        equal(array.get('isLoaded'), false, "After loading some records, the array isn't isLoaded");
      }
    }), 1);
  };

  array = store.findMany(Comment, [ 1, 2, 3 ]);
  equal(get(array, 'isLoaded'), false, "isLoaded should not be true when first created");
});
