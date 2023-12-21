# Bugz API

A JS API to interact with your FogBugz instance.

## Install

```sh 
npm install bugz-api
```

### Creating a client
```js
import createBugzClient from 'bugz-api';

const bugzClient = createBugzClient({
    token: 'asdfghjklqwer', // your private token
    domain: 'http://fogbugz.example.com/' // your base fogbugz URL
});

```

## createBugzClient

### Parameters

| Name      | Type   | Description   |
|-----------|--------|---------------|
| `options` | object |  (required)     |

#### Options Properties

| Property     | Type   | Description                                                           |
|--------------|--------|-----------------------------------------------------------------------|
| `token`      | string |  (required) - The access token in your account that enables API calls |
| `domain`     | string |  (required) - The base URL of your fogbugz site                       |

## Available APIs
* [cases](./docs/cases.md)
* [filters](./docs/filters.md)
* [people](./docs/people.md)
* [customFields](./docs/customfields.md)
