# Cases

## Available Methods

* [edit](#edit)
* [list](#list)
* [search](#search)
* [view](#view)
* [getCustomFieldOptions](#getcustomcieldoptions)

## edit

### Parameters


| Property  | Type  | Description |
|-----------|-------|-------------|
| `id`      | string |  (required) - The case id |
| `parameters` | object | [available properties](#available-columns) |

Example

```js
const response = await client.cases.edit('122133', {
    'sTitle': 'new title'
});
```

Example Response

```js
{ case: [ { ixBug: '122133', operations: 'edit,assign,resolve' } ] }
```

## list

| Property  | Type  | Description |
|-----------|-------|-------------|
| `filterId`   | string | The filter Id. Default is "inbox" |
| `parameters` | object | max , cols  |

* *"max" is the maximum number of records returned. Defaults to 100 if not overridden*
* *"cols is a comma separated list of [available properties](#available-columns)*

Example

```js
const response = await client.cases.list('1172', { 
  max: 5, 
  cols: 'sTitle, sEvent' 
});
```

Example Response

```js
{
  description: 'All open cases assigned to Stephen Wilson',
  sFilter: '1172',
  cases: [ 
    { 
      count: '2', 
      totalHits: '2', 
      case: [
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
    } 
  ]
}
```

## search

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `search`   | string | search for string |
| `parameters` | object | max , cols  |

* *"max" is the maximum number of records returned. Defaults to 100 if not overridden*
* *"cols is a comma separated list of [available properties](#available-columns)*

Example

```js
const response = await client.cases.search('Case Title', { 
  max: 5, 
  cols: 'sTitle' 
});
```

Example Response

```js
{
  description: 'All open cases assigned to Stephen Wilson',
  sFilter: '1172',
  cases: [ 
    { 
      count: '2', 
      totalHits: '2', 
      case: [
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
    } 
  ]
}
```

## view

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `id`   | string | id of the bug case |
| `parameters` | object | max , cols  |

* *"max" is the maximum number of records returned. Defaults to 100 if not overridden*
* *"cols is a comma separated list of [available properties](#available-columns)*

Example

```js
const response = await client.cases.view('122119', { 
  cols: 'sTitle' 
});
```

Example Response

```js
{
  case: [
    {
      ixBug: '122119',
      operations: 'edit,reopen',
      sTitle: 'FED Story: Display video hero'
    }
  ]
}
```

## getCustomFieldOptions

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `columnName` | string | name of the [column](#available-columns) |

*Custom field columns are prefixed with **"plugin_customfields_at_fogcreek_com_"***

Example

```js
const response = cases.getCustomFieldOptions('columnName');
```

Example Response

```js
[ 'Yes', 'No' ]
```

## Available Columns

| Name               | Type   | Description                                               |
|--------------------|--------|-----------------------------------------------------------|
| `ixBug`               | number | The id of bug/case                                       |
| `sTitle`            | string | The title of the bug                                      |
| `ixProject`          | number | The id of the project that the bug is under               |
| `ixPersonAssignedTo`       | number | The id of the person who the bug is currently assigned to |
| `plugin_customfields_at_fogcreek_com_casexmilestoneh849`    | string | The current milestone                                     |
| `plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b` | number | Ready for sprint QA                                       |
| `plugin_customfields_at_fogcreek_com_qaxtestablek42`       | string | QA Testable                                               |
| `plugin_customfields_at_fogcreek_com_casexsummaryp32b`      | string | Summary and notes for QA                                  |
| `sEvent`        | string | Case notes                                                |

Column constants are available on

```js 
cases.columns
```


[Back](../readme.md)