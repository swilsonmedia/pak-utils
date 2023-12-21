# Cases

## Available Methods

* [byId](#byid)
* [edit](#edit)
* [list](#list)
* [search](#search)
* [view](#view)

## Available Columns

| Name               | Type   | Description                                               |
|--------------------|--------|-----------------------------------------------------------|
| `id`               | number | The id of bug/case                                       |
| `title`            | string | The title of the bug                                      |
| `project`          | number | The id of the project that the bug is under               |
| `assignedTo`       | number | The id of the person who the bug is currently assigned to |
| `caseMilestone`    | string | The current milestone                                     |
| `readyForSprintQA` | number | Ready for sprint QA                                       |
| `qaTestable`       | string | QA Testable                                               |
| `caseSummary`      | string | Summary and notes for QA                                  |
| `caseNotes`        | string | Case notes                                                |

Column constants are available on

```js 
bugzClient.cases.columns
```

## byId

### Parameters

| Name      | Type   | Description   |
|-----------|--------|---------------|
| `options` | object |  (required)     |

#### Options Properties

| Property      | Type   | Description                                      |
|---------------|--------|--------------------------------------------------|
| `id`          | number |  (required)     - The case id                    |
| `columns`     | array  |  (optional)    - an array of valid column strings|
| `max`         | number | (optional) - number of cases to return           |

Example

```js

const options = {
    id: 555, 
    columns: ['sTitle']
};

const case = await bugzClient.cases.byId(options);

```

Example Response

```json
{
  id: '122133',
  operations: 'edit,assign,resolve',
  title: "Hey this is your case title"
}
```

## edit

### Parameters

| Name      | Type   | Description   |
|-----------|--------|---------------|
| `options` | object |  (required)     |

#### Options Properties

| Property                      | Type              | Description                                                                            |
|-------------------------------|-------------------|----------------------------------------------------------------------------------------|
| `id`                          | number            |  (required) - The case id                                                              |
| [columns](#available-columns) | depends on column |  (all are optional) see list of available columns to update [here](#available-columns) |

Example

```js

const options = {
    id: 122133, 
    [bugzClient.cases.columns.title]: 'new title',
    ...otherColumnsToUpdate
};

const case = await bugzClient.cases.edit(options);

```

Example Response

```json
{
  id: '122133',
  operations: 'edit,assign,resolve',
}
```

## list

### Parameters

| Name      | Type   | Description   |
|-----------|--------|---------------|
| `options` | object | (optional)    |

#### Options Properties

| Property      | Type             | Description                                       | Default |
|---------------|------------------|---------------------------------------------------|---------|
| `filter`      | string           | (optional) - the fitler 'sFilter' value           | 'inbox' |
| `columns`     | array            |  (optional)    - an array of valid column strings  |         |
| `max`         | number           | (optional) - number of cases to return            |         |

Example

```js

const options = {
    filter: 555, 
    columns: ['sTitle'],
    max: 3
};

const case = await bugzClient.cases.list(options);

```

Example Response

```json
{
  description: 'All open cases in Inbox',
  sFilter: 'inbox',
  cases: [
    {
      id: '122133',
      operations: 'edit,assign,resolve',
      title: "Case Title 1"
    },
    {
      id: '122279',
      operations: 'edit,assign,resolve',
      title: "Case Title 2"
    },
    {
      id: '121510',
      operations: 'edit,assign,resolve',
      title: "Case Title 3"
    }
  ]
}
```

## search

### Parameters

| Name      | Type   | Description   |
|-----------|--------|---------------|
| `options` | object | (optional)    |

#### Options Properties

| Property      | Type             | Description                                       |
|---------------|------------------|---------------------------------------------------|
| `search`      | string           | (optional) - string to search for                 |
| `columns`     | array            |  (optional)    - an array of valid column strings  | 
| `max`         | number           | (optional) - number of cases to return            |

Example

```js

const options = {
    filter: 555, 
    columns: ['sTitle'],
    max: 3
};

const case = await bugzClient.cases.list(options);

```

Example Response

```json
{
  cases: [
    {
      id: '122133',
      operations: 'edit,assign,resolve',
      title: "Case Title 1"
    },
    {
      id: '122279',
      operations: 'edit,assign,resolve',
      title: "Case Title 2"
    },
    {
      id: '121510',
      operations: 'edit,assign,resolve',
      title: "Case Title 3"
    }
  ]
}
```

## view

### Parameters

| Name      | Type   | Description   |
|-----------|--------|---------------|
| `options` | object | (required)    |

#### Options Properties

| Property      | Type             | Description                                       |
|---------------|------------------|---------------------------------------------------|
| `id`          | number           | (required) - The case number                      |
| `columns`     | array            |  (optional)    - an array of valid column strings  | 

Example

```js

const options = {
    filter: 555, 
    columns: ['sTitle'],
    max: 3
};

const case = await bugzClient.cases.list(options);

```

Example Response

```json
{
  cases: [
    {
      id: '122133',
      operations: 'edit,assign,resolve',
      title: "Case Title 1"
    },
    {
      id: '122279',
      operations: 'edit,assign,resolve',
      title: "Case Title 2"
    },
    {
      id: '121510',
      operations: 'edit,assign,resolve',
      title: "Case Title 3"
    }
  ]
}
```

[Back](../readme.md)