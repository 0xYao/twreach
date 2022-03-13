# twreach CLI

A human-aided Twitter outreach bot. Improve your Twitter outreach efficiency by 100x.

## Development

### Setup the Environment

1. Copy the environment variables: `cp .env.example .env`
1. Install the project dependencies: `yarn`
1. Setup the command line binary: `yarn link`
1. Spin up the database: `yarn postgres:start`
1. Migrate the db schema: `yarn migrate:dev`

### Setup the Twitter App

Note: you need to manually apply for elevated access if your Twitter App doesn't have it already.

1. Create or access the Twitter App from the [developer portal](https://developer.twitter.com/en/portal/projects-and-apps). Copy and paste the API key and API key secret to .env.
1. Setup your user authentication settings from the "Settings" tab, select the `OAuth 1.0a` and choose `Read and write and Direct message` for the App permissions.
1. Use any valid urls e.g. `http://localhost:3000/auth_callback`, and any valid urls with   `https` scheme for the "Website url", e.g. `https://yourwebsite.com`.
1. Go to the "Keys and tokens" tab of the app and copy, generate the access token and paste your the respective key and secrets to `.env`.

### Add the Prospects to DB

1. Ask the team members which Twitter outreach batch you are responsible for. (Note: the batches are generated via `twreach g-batches --batchSize 3` where the batchSize can be the number of people in the team)
1. Copy the JSON and add the prospects to the DB: `mkdir -p src/tmp && mv my-batch.json src/tmp/my-batch.json && twreach upsert-prospects --jsonFile ./src/tmp/my-batch.json`

### Running the project
1. `cp src/templates/custom-impl.ts src/tmp/custom-impl.ts`, and update the methods such as `getDMVariations` per your needs.
1. Finally, start your outreach: `twreach --limit 5` (this will allow you to outreach to 5 projects at a time, and you can only DM a project once unless you are doing follow-ups.)

## Assumptions

- If the project has more 1,000 ETH (i.e. they are a very successful project) of total volume, then we will like and reply to one of their tweets before we send the DM to increase our chance 

## Common Errors

- `Elevated access is required`: the Twitter App needs elevated access to DM people.
- `command twreach is not found`: try `./bin/twreach` instead.

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

# Todos

1. Add the functionality to batch and schedule send all messages automatically, e.g. DM 10 projects every hour, and schedule send the replies to the projects' tweets too.
