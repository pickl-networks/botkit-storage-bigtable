var Q = require('q');

// var instance, table; //= bigtable.instance('instance-1');
// var table = instance.table('PCKLISS');

// var gcloud = require('google-cloud');

  /**
   * The Botkit google cloud bigtable driver
   *
   * @param {Object} config This must contain a `projectId` property
   * @returns {{teams: {get, save, all}, channels: {get, save, all}, users: {get, save, all}}}
   */

var bigtable;

module.exports = function(config) {
  if (!config || !config.projectId) {
    throw new Error('projectId is required.');
  } else if (!config.instance) {
    throw new Error('instance is required.');
  } else if (!config.column_family) {
    throw new Error('column family is required.');
  } else if (!config.table) {
    throw new Error('table is required.');
  }

  bigtable = require('@google-cloud/bigtable')({
    projectId: config.projectId,
  });

  var instance = bigtable.instance(config.instance);
  var table = instance.table(config.table);
  var cf = config.column_family;

  console.log('--------------------');
  console.log(config);
  console.log('--------------------');

  return {
    teams: {
      get: get(table, cf, 'team'),
      save: save(table, cf, 'team'),
      all: all(table, cf, 'team'),
      remove: remove(table, cf, 'team')
    },
    channels: {
      get: get(table, cf, 'chan'),
      save: save(table, cf, 'chan'),
      all: all(table, cf, 'chan')
    },
    users: {
      get: get(table, cf, 'user'),
      save: save(table, cf, 'user'),
      all: all(table, cf, 'user')
    }
  };
};

/**
 * Given a datastore reference and a kind, will return a function that will get a single entity by key
 *
 * @param {Object} datastore A reference to the datastore Object
 * @param {String} kind The entity kind
 * @returns {Function} The get function
 */
function get(table, family, column) {

  var getRow = function(table, id) {
    var deferred = Q.defer();

    var row = table.row(id);
    row.get(id, function(err, data) {
      if (err) {
        deferred.reject();
      } else {
        deferred.resolve(JSON.parse(data.data[family][column][0].value));
      }
    });

    return deferred.promise;
  };

  var get = function(id, cb) {
    id = id.split('').reverse().join('');
    getRow(table, id).then(function(data) {
      cb(data, null);
    }, function() {
      cb(null, null);
    });
  };

  return get;
}

/**
 * Given a datastore reference and a kind, will return a function that will save an entity.
 * The object must have an id property
 *
 * @param {Object} datastore A reference to the datastore Object
 * @param {String} kind The entity kind
 * @returns {Function} The save function
 */
function save(table, family, column) {
    return function(data, cb) {

      if (data.id) {

        // Reverse the key so we don't get hotspots
        var r = {};
        r.key = data.id.split('').reverse().join('');

        r.data = {};
        r.data[family] = {};
        r.data[family][column] = JSON.stringify(data);

        // Needs error handling !!!!! //
        table.insert([r], function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    };
}

/**
 * Given an id, table and kind, will return a function that will delete the row.
 * The object must have an id property
 *
 * @param {Object} datastore A reference to the datastore Object
 * @param {String} kind The entity kind
 * @returns {Function} The save function
 */
function remove(table, family, column) {
    return function(id, cb) {
      id = id.split('').reverse().join('');
      var row = table.row(id);
      row.delete(function(err, apiResponse) {});
    };
}

/**
 * Given a bigtable table and cf, this will return a function that will return all stored teams.
 */
function all(table, cf, column) {

  var getRows = function(table, family, column) {
    var deferred = Q.defer();

    var filter = [
      {
        column: {
          family: column,
          cellLimit: 1
        }
      },
      {
        family: family
      }
    ];

    var opts = {
      filter: filter
    };

    var result = [];
    table.getRows(opts).then(function(data) {
      for (var i = 0, len = data[0].length; i < len; i++) {
        result.push(JSON.parse(data[0][i].data[family][column][0].value));
      }

      if (result.length === data[0].length) {
        deferred.resolve(result);
      }
    });
    return deferred.promise;
  };

  var all = function(cb) {
    getRows(table, cf, column).then(function(data) {
      cb(null, data);
    }, function() {
      cb(null, null);
    });

  };
  return all;
}
