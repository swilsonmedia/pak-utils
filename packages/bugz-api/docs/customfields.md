## customFields

* [fields](#fields)
* [getOptions](#getOptions)

### fields

Constants to use in [getOptions](#getoptions)

#### Constants
* caseMilestone 
* readyForSprintQA
* qaTestable
* caseSummary

Custom field constants are available on

```js

bugzClient.customFields

```


### getOptions

Knowing the custom fields and their possible values become helpful when editing [cases](./cases.md)

Example

```js

const case = await bugzClient.customFields.getOptions(bugzClient.customFields.qaTestable);

```

Response will be an array of undefined

Example Response

```json
[ 'Yes', 'No' ]
```

[Back](../readme.md)