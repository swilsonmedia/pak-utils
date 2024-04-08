# Bugz API

An API to interact with your FogBugz instance.

## Install and Build

See install and build steps [here](../../readme.md).

### Creating a client

```js
import bugzClient from 'bugz-api';

const client = bugzClient({
    token: 'asdfghjklqwer', // your private token
    domain: 'http://fogbugz.example.com' // your base fogbugz URL
});
```

## bugzClient

### Parameters

| Name      | Type   | Description   |
|-----------|--------|---------------|
| `options` | object |  (required)     |

#### Options Properties

| Property     | Type   | Description                                                           |
|--------------|--------|-----------------------------------------------------------------------|
| `token`      | string |  (required) - The access token in your account that enables API calls |
| `origin`     | string |  (required) - The base URL of your fogbugz site                       |

## Available Methods

* [edit](#edit)
* [listCases](#listCases)
* [listFilters](#listFilters)
* [listPeople](#listPeople)
* [viewCase](#viewCase)
* [search](#search)
* [viewPerson](#viewPerson)

## listFilters

Example

```js
const response = await client.listFilters();
```

Example Response

```js
[
  {type: 'builtin', sFilter: 'inbox', text: 'Inbox'},
  {type: 'shared', sFilter: '123', text: 'My Shared Filter'}
] 
```

## viewPerson

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `id`   | string |  (required) - the ixPerson |

Example

```js
const response = await client.viewPerson('548');
```

Example Response

```js
{
  fAdministrator: true
  fCommunity: false
  fDeleted: false
  fVirtual: false
  ixBugWorkingOn: 0
  ixPerson: 141
  nType: 1
  sFullName: 'Marshall Mathers',
  sEmail: 'slim.shady@example.com',
  sHomepage: ""
  sLanguage: "*"
  sLocale: "*"
  sPhone: "(508) 927-8584"
  sSnippetKey: "`"
  sTimeZoneKey: "*"
}
```

## listPeople


Example

```js
const response = await client.listPeople();
```

Example Response

```js
[  
  {
    dtLastActivity: "2024-01-21T02:36:52Z"
    fAdministrator: false
    fCommunity: false
    fDeleted: false
    fNotify: true
    fPaletteExpanded: false
    fRecurseBugChildren: true
    fVirtual: false
    ixBugWorkingOn: 0
    ixPerson: 548
    sEmail: "slim.shady@example.com"
    sFrom: ""
    sFullName: "Marshall Mathers"
    sHomepage: ""
    sLDAPUid: ""
    sLanguage: "*"
    sLocale: "*"
    sPhone: ""
    sTimeZoneKey: "*"
  }
] 
```

## edit

### Parameters


''

| Property  | Type  | Description |
|-----------|-------|-------------|
| `id`      | string |  (required) - The case id |
| `parameters` | object | sTitle, ixProject, ixPersonAssignedTo, plugin_customfields_at_fogcreek_com_casexmilestoneh849, plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b, plugin_customfields_at_fogcreek_com_qaxtestablek42, plugin_customfields_at_fogcreek_com_casexsummaryp32b, sEvent

Example

```js
const response = await client.edit('122133', {
    'sTitle': 'new title'
});
```

Example Response

```js
{ 
  case: { 
    ixBug: '122133', 
    operations: 'edit,assign,resolve' 
  }
}
```

## listCases

| Property  | Type  | Description |
|-----------|-------|-------------|
| `filterId`   | string | The filter Id. Default is "inbox" |
| `parameters` | object | max, cols  |

* *"max" is the maximum number of records returned. Defaults to 100 if not overridden*
* *"cols" is a comma separated list of these options: sTitle, ixProject, ixPersonAssignedTo, plugin_customfields_at_fogcreek_com_casexmilestoneh849, plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b, plugin_customfields_at_fogcreek_com_qaxtestablek42, plugin_customfields_at_fogcreek_com_casexsummaryp32b, events, latestEvent, plugin_customfields  

Example

```js
const response = await client.listCases('1172', { 
  max: 2, 
  cols: 'sTitle, sEvent' 
});
```

Example Response

```js
[ 
  {
    ixBug: '1234',
    operations: 'edit,assign,resolve',
    sTitle: "Case 1"
  },
  {
    ixBug: '1235',
    operations: 'edit,assign,resolve',
    sTitle: 'Case 2'
  }
]
```

## search

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `search`   | string | search for string |
| `parameters` | object | max, cols  |

* *"max" is the maximum number of records returned. Defaults to 100 if not overridden*
* *"cols" is a comma separated list of these options: sTitle, ixProject, ixPersonAssignedTo, plugin_customfields_at_fogcreek_com_casexmilestoneh849, plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b, plugin_customfields_at_fogcreek_com_qaxtestablek42, plugin_customfields_at_fogcreek_com_casexsummaryp32b, events, latestEvent, plugin_customfields  

Example

```js
const response = await client.search('Case Title', { 
  max: 2, 
  cols: 'sTitle' 
});
```

Example Response

```js
[
  {
    ixBug: '1234',
    operations: 'edit,assign,resolve',
    sTitle: "Case 1"
  },
  {
    ixBug: '1235',
    operations: 'edit,assign,resolve',
    sTitle: 'Case 2'
  }
]
```

## viewCase

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `id`   | string | id of the bug case |
| `parameters` | object | max, cols  |

* *"max" is the maximum number of records returned. Defaults to 100 if not overridden*
* *"cols" is a comma separated list of these options: sTitle, ixProject, ixPersonAssignedTo, plugin_customfields_at_fogcreek_com_casexmilestoneh849, plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b, plugin_customfields_at_fogcreek_com_qaxtestablek42, plugin_customfields_at_fogcreek_com_casexsummaryp32b, events, latestEvent, plugin_customfields  

Example

```js
const response = await client.viewCase('122119', { 
  cols: 'sTitle' 
});
```

Example Response

```js
{
  ixBug: '122119',
  operations: 'edit,reopen',
  sTitle: 'FED Story: Display video hero'
}
```



