# twreach CLI

A human-aided Twitter outreach bot. Improve your Twitter outreach efficiency by 100x.

## Development

1. Copy the environment variables: `cp .env.example .env`
1. Install the project dependencies: `yarn`
1. Setup the command line binary: `yarn link`
1. Spin up the database: `yarn postgres:start`
1. Migrate the db schema: `yarn migrate:dev`
1. Create an Twitter App if you don't have it already from the [developer portal](https://developer.twitter.com/en/portal/projects-and-apps). Copy and paste the API key and API key secret to .env.
    - Setup your user authentication settings from the "Settings" tab, select the `OAuth 1.0a` and choose `Read and write and Direct message` for the App permissions.
    - Use `http://localhost:3000/auth_callback` (any url is fine, we won't be using any authorize_url here) for "Callback url" and any valid urls with   `https` scheme for the "Website url", e.g. `https://nftearn.xyz`.
1. Go to the "Keys and tokens" tab of the app and copy, generate the access token and paste your the respective key and secrets to `.env`.
1. Ask the team members which Twitter outreach batch you are responsible for, e.g. the batches are generated via `twreach g-batches --batchSize 3` where the batchSize can be the number of people in the team.
1. Copy the JSON and add the prospects to the DB: `mkdir -p src/tmp && mv my-batch.json src/tmp/my-batch.json && twreach create-prospects --jsonFile ./src/tmp/my-batch.json`
1. Finally, start your outreach: `twreach --limit 5` (this will allow you to outreach to 5 projects at a time, and you can only outreach to a project once.)

## Assumptions

- If the project has more 1,000 ETH (i.e. they are a very successful project) of total volume, then we will like and reply to one of their tweets before we send the DM to increase our chance 

## Customizing your CLI

Check out the documentation at https://github.com/infinitered/gluegun/tree/master/docs.

## Publishing to NPM

To package your CLI up for NPM, do this:

```shell
$ npm login
$ npm whoami
$ npm test

$ npm run build

$ npm publish
```

# License

MIT - see LICENSE
