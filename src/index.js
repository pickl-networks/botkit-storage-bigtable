var bigtable = require('@google-cloud/bigtable')({
  projectId: process.env.PROJECT_ID || 'emulator-project-id',
});

var Q = require('q');

// var gcloud = require('google-cloud');

/**
 * The Botkit google cloud bigtable driver
 *
 * @param {Object} config This must contain a `projectId` property
 * @returns {{teams: {get, save, all}, channels: {get, save, all}, users: {get, save, all}}}
 */
module.exports = function(config) {
    if (!config || !config.projectId) {
        throw new Error('projectId is required.');
    }

    var datastore, table, cf;

    // var datastore = gcloud.datastore(config),
    //     namespace = config.namespace,
    //     teamKind = config.teamKind || 'BotkitTeam',
    //     channelKind = config.channelKind || 'BotkitChannel',
    //     userKind = config.userKind || 'BotkitUser';

    return {
        teams: {
            get: get(datastore, table, cf),
            save: save(datastore, table, cf),
            all: all(datastore, table, cf)
        },
        channels: {
            get: get(datastore, table, cf),
            save: save(datastore, table, cf),
            all: all(datastore, table, cf)
        },
        users: {
            get: get(datastore, table, cf),
            save: save(datastore, table, cf),
            all: all(datastore, table, cf)
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
function get(datastore, kind, namespace) {
    return function(id, cb) {
      var team = {}
      team.id = 123
      team = JSON.stringify(team);

      return cb(null, team);
        // var keyParam = [kind, id];
        // if (namespace) {
        //     keyParam = {
        //         namespace: namespace,
        //         path: keyParam
        //     };
        // }
        // var key = datastore.key(keyParam);

        // datastore.get(key, function(err, entity) {
        //     if (err)
        //         return cb(err);

        //     return cb(null, entity ? entity : null);
        // });
    };
};

/**
 * Given a datastore reference and a kind, will return a function that will save an entity.
 * The object must have an id property
 *
 * @param {Object} datastore A reference to the datastore Object
 * @param {String} kind The entity kind
 * @returns {Function} The save function
 */
function save(datastore, kind, namespace) {
    return function(data, cb) {
        var keyParam = [kind, data.id];
        if (namespace) {
            keyParam = {
                namespace: namespace,
                path: keyParam
            };
        }
        var key = datastore.key(keyParam);
        datastore.save({
            key: key,
            // @TODO: convert object to array so that we can exclude properties from indexes
            // data: [
            //   {
            //     name: 'rating',
            //     value: 10,
            //     excludeFromIndexes: true
            //   }
            // ]
            data: data
        }, cb);
    };
};

var getRows = function() {

}

/**
 * Given a datastore reference and a kind, will return a function that will return all stored entities.
 *
 * @param {Object} datastore A reference to the datastore Object
 * @param {String} kind The entity kind
 * @returns {Function} The all function
 */
function all(datastore, kind, namespace) {

  var instance = bigtable.instance('instance-1');
  var table = instance.table('PCKLISS');

  var egg = function() {
    var deferred = Q.defer();
    table.getRows(function(err, rows) {
      console.log('===========================')
      console.log(rows)
      deferred.resolve();
    });

    // table.getRows().then(function(data) {
    //   rows = data[0];
    //   console.log(rows)
    // }, function() {
    //   deferred.resolve();
    // });

    return deferred.promise;
  }

    var test = function(cb) {
      var teams = [];


      var team = {}
      team.id = 123
      teams.push(team);

      var rows;

      egg().then(function() {
        cb(null, teams);
      }, function() {
        cb(null, teams);
      })


      // table.getRows(function(err, rows) {
      //   // if (!err) {

      //     // `rows` is an array of Row objects.
      //   // }
      // });

    };
    return test;
};
