# fibery-web-extension

## How to start as web page for development 

Prerequisites: personal account is set up, e.g. `my-account.fibery.io`

1. [Acquire API token](https://api.fibery.io/#authentication)
2. Create `.env` file in root folder with the following content:

```
FIBERY_AUTH_TOKEN=<auth-token>
REMOTE_HOST=https://my-account.fibery.io
```

3. Run `yarn start` and access UI normally: `http://localhost:3000/`


## how to build extension

```
REACT_APP_HOST=https://fibery.io INLINE_RUNTIME_CHUNK=false yarn build
```
