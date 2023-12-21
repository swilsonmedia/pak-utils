# People

## Available Methods

* [byId](#byid)
* [byEmail](#byemail)
* [byName](#byname)
* [list](#list)

## byId

### Parameters

| Name      | Type   | Description   |
|-----------|--------|---------------|
| `id`      | number |  (required)     |

Example

```js

const case = await bugzClient.people.byId(123);

```

Example Response

```json
{
  ixPerson: '123',
  sFullName: 'Marshall Mathers',
  sEmail: 'snoop.dogg@example.com',
  sPhone: '',
  fAdministrator: 'false',
  fCommunity: 'false',
  fVirtual: 'false',
  fDeleted: 'false',
  sHomepage: '',
  sLocale: '*',
  sLanguage: '*',
  sTimeZoneKey: '*',
  sSnippetKey: '`',
  ixBugWorkingOn: '0',
  nType: '0'
}
```

## byEmail

### Parameters

| Name         | Type   | Description                                 |
|--------------|--------|---------------------------------------------|
| `email`      | string |  (required)     full or partial email address |

Example

```js

const case = await bugzClient.people.byEmail('marshall.mathers@example.com');

```

Example Response

```json
[
  {
    ixPerson: '123',
    sFullName: 'Marshall Mathers',
    sEmail: 'marshall.mathers@example.com',
    sPhone: '',
    fAdministrator: 'false',
    fCommunity: 'false',
    fVirtual: 'false',
    fDeleted: 'false',
    sHomepage: '',
    sLocale: '*',
    sLanguage: '*',
    sTimeZoneKey: '*',
    sSnippetKey: '`',
    ixBugWorkingOn: '0',
    nType: '0'
  }
]
```

## byName

### Parameters

| Name         | Type   | Description                                 |
|--------------|--------|---------------------------------------------|
| `name`       | string |  (required)     full or partial name          |

Example

```js

const case = await bugzClient.people.byName('Marshall Mathers');

```

Example Response

```json
[
  {
    ixPerson: '123',
    sFullName: 'Marshall Mathers',
    sEmail: 'marshall.mathers@example.com',
    sPhone: '',
    fAdministrator: 'false',
    fCommunity: 'false',
    fVirtual: 'false',
    fDeleted: 'false',
    sHomepage: '',
    sLocale: '*',
    sLanguage: '*',
    sTimeZoneKey: '*',
    sSnippetKey: '`',
    ixBugWorkingOn: '0',
    nType: '0'
  }
]
```

## list

Example

```js

const case = await bugzClient.people.list();

```

Example Response

```json
[
  {
    ixPerson: '123',
    sFullName: 'Marshall Mathers',
    sEmail: 'marshall.mathers@example.com',
    sPhone: '',
    fAdministrator: 'false',
    fCommunity: 'false',
    fVirtual: 'false',
    fDeleted: 'false',
    sHomepage: '',
    sLocale: '*',
    sLanguage: '*',
    sTimeZoneKey: '*',
    sSnippetKey: '`',
    ixBugWorkingOn: '0',
    nType: '0'
  },
  {
    ixPerson: '234',
    sFullName: 'Snoop Dogg',
    sEmail: 'snoop.dogg@example.com',
    sPhone: '',
    fAdministrator: 'false',
    fCommunity: 'false',
    fVirtual: 'false',
    fDeleted: 'false',
    sHomepage: '',
    sLocale: '*',
    sLanguage: '*',
    sTimeZoneKey: '*',
    sSnippetKey: '`',
    ixBugWorkingOn: '0',
    nType: '0'
  }
]
```

[Back](../readme.md)