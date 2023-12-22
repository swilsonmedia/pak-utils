# Filters

## Available Methods

* [list](#list)
* [listSaved](#listsaved)
* [listShared](#listshared)
* [listBuiltIn](#listbuiltIn)

## list

Example

```js
const response = await client.filters.list();
```

Example Response

```js
[
  { _: 'My Cases', type: 'builtin', sFilter: 'ez' },
  { _: 'Inbox', type: 'builtin', sFilter: 'inbox' },
] 
```
## listSaved

Example

```js
const response = await client.filters.listSaved();
```

Example Response

```js
[
  { _: 'Saved 1', type: 'saved', sFilter: '1234' },
  { _: 'Saved 2', type: 'saved', sFilter: '2345' },
] 
```
## listShared

Example

```js
const response = await client.filters.listShared();
```

Example Response

```js
[
  { _: 'Shared 1', type: 'shared', sFilter: '1234' },
  { _: 'Shared 2', type: 'shared', sFilter: '2345' },
]
```
## listBuiltIn

Example

```js
const response = await client.filters.listBuiltIn();
```

Example Response

```js
[
  { _: 'BuiltIn 1', type: 'builtin', sFilter: '1234' },
  { _: 'BuiltIn 2', type: 'builtin', sFilter: '2345' },
] 
```

[Back](../readme.md)