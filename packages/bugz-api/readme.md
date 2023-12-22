# Bugz API

A JS API to interact with your FogBugz instance.

## Install

```sh 
npm install bugz-api
```

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

## Available APIs
* [cases](./docs/cases.md)
* [filters](./docs/filters.md)
* [people](./docs/people.md)

