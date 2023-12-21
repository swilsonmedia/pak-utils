# Filters

## Available Methods

* [list](#list)
* [listSaved](#listsaved)
* [listShared](#listshared)
* [listBuiltIn](#listbuiltIn)

## list

Example

```js

const case = await bugzClient.filters.list();

```

Example Response

```json
[
  {
    { _: 'My Cases', type: 'builtin', sFilter: 'ez' },
    { _: 'Inbox', type: 'builtin', sFilter: 'inbox' },
    { _: 'Some Save Filter', type: 'saved', sFilter: '1234' },
  }
]
```
## listSaved

Example

```js

const case = await bugzClient.filters.listSaved();

```

Example Response

```json
[
  {
    { _: 'Saved 1', type: 'saved', sFilter: '1234' },
    { _: 'Saved 2', type: 'saved', sFilter: '2345' },
  }
]
```
## listShared

Example

```js

const case = await bugzClient.filters.listShared();

```

Example Response

```json
[
  {
    { _: 'Shared 1', type: 'shared', sFilter: '1234' },
    { _: 'Shared 2', type: 'shared', sFilter: '2345' },
  }
]
```
## listBuiltIn

Example

```js

const case = await bugzClient.filters.listBuiltIn();

```

Example Response

```json
[
  {
    { _: 'BuiltIn 1', type: 'builtin', sFilter: '1234' },
    { _: 'BuiltIn 2', type: 'builtin', sFilter: '2345' },
  }
]
```

[Back](../readme.md)