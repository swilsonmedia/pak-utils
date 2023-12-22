# People

## Available Methods

* [byId](#byid)
* [byEmail](#byemail)
* [byName](#byname)
* [list](#list)

## byId

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `id`   | string |  (required) - the ixPerson |

Example

```js
const response = await client.people.byId('548');
```

Example Response

```js
{
  person: [
    {
      ixPerson: '548',
      sFullName: 'Marshall Mathers',
      sEmail: 'slim.shady@example.com',
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
}
```

## byEmail

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `email`   | string |  (required) - a full or partial email address |

Example

```js
const response = await client.people.byEmail('slim.shady@example.com');
```

Example Response

```js
{ 
  people: [ 
    { 
      person: [  
        {
          ixPerson: '548',
          sFullName: 'Marshall Mathers',
          sEmail: 'slim.shady@example.com',
          sPhone: '',
          fAdministrator: 'false',
          fCommunity: 'false',
          fVirtual: 'false',
          fDeleted: 'false',
          fNotify: 'true',
          sHomepage: '',
          sLocale: '*',
          sLanguage: '*',
          sTimeZoneKey: '*',
          sLDAPUid: '',
          dtLastActivity: '2023-12-22T02:46:35Z',
          fRecurseBugChildren: 'true',
          fPaletteExpanded: 'false',
          ixBugWorkingOn: '0',
          sFrom: ''
        }
      ] 
    } 
  ] 
}
```

## byName

### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `name`   | string |  (required) - a full or partial name |

Example

```js
const response = await client.people.byName('Marshal Mathers');
```

Example Response

```js
{ 
  people: [ 
    { 
      person: [  
        {
          ixPerson: '548',
          sFullName: 'Marshall Mathers',
          sEmail: 'slim.shady@example.com',
          sPhone: '',
          fAdministrator: 'false',
          fCommunity: 'false',
          fVirtual: 'false',
          fDeleted: 'false',
          fNotify: 'true',
          sHomepage: '',
          sLocale: '*',
          sLanguage: '*',
          sTimeZoneKey: '*',
          sLDAPUid: '',
          dtLastActivity: '2023-12-22T02:46:35Z',
          fRecurseBugChildren: 'true',
          fPaletteExpanded: 'false',
          ixBugWorkingOn: '0',
          sFrom: ''
        }
      ] 
    } 
  ] 
}
```

## list



Example

```js
const response = await client.people.list();
```

Example Response

```js
{ 
  people: [ 
    { 
      person: [  
        {
          ixPerson: '548',
          sFullName: 'Marshall Mathers',
          sEmail: 'slim.shady@example.com',
          sPhone: '',
          fAdministrator: 'false',
          fCommunity: 'false',
          fVirtual: 'false',
          fDeleted: 'false',
          fNotify: 'true',
          sHomepage: '',
          sLocale: '*',
          sLanguage: '*',
          sTimeZoneKey: '*',
          sLDAPUid: '',
          dtLastActivity: '2023-12-22T02:46:35Z',
          fRecurseBugChildren: 'true',
          fPaletteExpanded: 'false',
          ixBugWorkingOn: '0',
          sFrom: ''
        }
      ] 
    } 
  ] 
}
```

[Back](../readme.md)