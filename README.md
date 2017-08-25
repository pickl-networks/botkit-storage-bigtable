# botkit-storage-bigtable

A Google Cloud Bigtable storage module for Botkit. Cloned and modified from: https://github.com/fabito/botkit-storage-datastore

## Usage

Just require `botkit-storage-bigtable` and pass it a config with a `projectId` and `table` option.
Then pass the returned storage when creating your Botkit controller. Botkit will do the rest.

Make sure everything you store has an `id` property, that's what you'll use to look it up later.

```
var Botkit = require('botkit'),
    bigtableStorage = require('botkit-storage-bigtable')({projectId: '...', table: '...'}),
    controller = Botkit.slackbot({
        storage: bigtableStorage
    });
```

```
// then you can use the Botkit storage api, make sure you have an id property
var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};
controller.storage.teams.save(beans);
beans = controller.storage.teams.get('cool');
```
