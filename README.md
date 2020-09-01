# stream.new

This example uses Mux Video Direct Uploads and NextJS. This is a functioning application at https://stream.new. Feel free to use it!

## Demo

### [https://stream.new/](https://stream.new/)

## Deploy your own

This example can be easily deploeyd to [Vercel](https://vercel.com/home). Download it and run `vercel` from the command line.

## Note

This example uses:

Mux:

- [Direct uploads](https://docs.mux.com/docs/direct-upload) - this is an API for uploading video files from a client to create Mux Assets
- [Webhook signature verification](https://docs.mux.com/docs/webhook-security) - webhook signature verification to make sure Mux webhooks are coming from a trusted source
- [HLS.js](https://github.com/video-dev/hls.js/) - for doing HLS video playback of videos

**Slackbot moderator**. This examples allows you to configure a `SLACK_WEBHOOK_ASSET_READY`. When a new Mux asset is `ready`, an Incoming Webhook for slack will be sent. This is an example of how you might integrate a Slack channel that can be used to moderate content. The Slack message contains the asset ID, playback ID and a thumbnail from the video.

NextJS:

- [SWR](https://swr.now.sh/) — dynamically changing the `refreshInterval` depending on if the client should be polling for updates or not
- [`/pages/api`](pages/api) routes — a couple endpoints for making authenticated requests to the Mux API.
- Dynamic routes using [`getStaticPaths` and `fallback: true`](https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation), as well as dynamic API routes.

This app was created with the [NextJS `with-mux-video` example](https://github.com/vercel/next.js/tree/canary/examples/with-mux-video) as a starting point.

## Configuration

### Step 1. Create an account in Mux

All you need to set this up is a [Mux account](https://mux.com). You can sign up for free and pricing is pay-as-you-go. There are no upfront charges, you get billed monthly only for what you use.

Without entering a credit card on your Mux account all videos are in “test mode” which means they are watermarked and clipped to 10 seconds. If you enter a credit card all limitations are lifted and you get \$20 of free credit. The free credit should be plenty for you to test out and play around with everything before you are charged.

### Step 2. Set up environment variables

Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

Then, go to the [settings page](https://dashboard.mux.com/settings/access-tokens) in your Mux dashboard set each variable on `.env.local`, get a new **API Access Token** and set each variable in `.env.local`:

- `MUX_TOKEN_ID` should be the `TOKEN ID` of your new token
- `MUX_TOKEN_SECRET` should be `TOKEN SECRET`
- `MUX_WEBHOOK_SIGNATURE_SECRET` (optional) - the webhook signing secret if you set up webhooks (see below)
- `SLACK_WEBHOOK_ASSET_READY` (optional) - the slack webhook URL that will be used for the **Slackbot moderator** feature (see below)

### Step 3. Deploy on Vercel

You can deploy this app to the cloud with [Vercel](https://vercel.com/import?filter=next.js&utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

To deploy on Vercel, you need to set the environment variables using [Vercel CLI](https://vercel.com/download) ([Documentation](https://vercel.com/docs/cli#commands/secrets)).

Install the [Vercel CLI](https://vercel.com/download), log in to your account from the CLI, and run the following commands to add the environment variables. Replace the values with the corresponding strings in `.env.local`:

```bash
vercel secrets add stream_new_token_id <MUX_TOKEN_ID>
vercel secrets add stream_new_token_secret <MUX_TOKEN_SECRET>
```

Then push the project to GitHub/GitLab/Bitbucket and [import to Vercel](https://vercel.com/import?filter=next.js&utm_source=github&utm_medium=readme&utm_campaign=next-example) to deploy.

### Step 4 (optional) Slackbot Moderator

This application uses a slackbot to send message to a slack channel every time a new asset is ready for playback. This requires a few steps for setup.

First, login to your Mux dashboard and in the left sidebar navigation find Settings > Webhooks. Create a new webhook and makes sure you are creating a webhook for the environment that matches the access token that you are using.

[Mux Webhook Create]('./mux-webhook-create.png')

For local development you may want to use a tool [like ngrok](https://ngrok.com/) to receive webhooks on localhost. The route for the webhook handler is `/api/webhooks/mux` (defined in this NextJS app under `./pages/api/webhooks/mux`).

(Optional) for extra security you can click "Show Signing Secret" and enter that value as `MUX_WEBHOOK_SIGNATURE_SECRET`. This is a security mechanism that checks the webhook signature header when the request hits your server so that your server can verify that the webhook came from Mux. Read more about [webhook signature verification](https://docs.mux.com/docs/webhook-security). Note that in `./pages/api/webhooks/mux` the code will only verify the signature if you have set a signature secret variable, so this step is completely optional.

Create a Slack 'Incoming Webhook'. Configure the channel you want to post to, the icon, etc.

[Slack Incoming Webhook]('./incoming-webhook.png')

When you're done with this, you should have a slack webhook URL that looks something like `https://hooks.slack.com/services/...`, set this variable as `SLACK_WEBHOOK_ASSET_READY`.

If you are deploying this to vercel, set the environment variables in your production environment:

```
vercel secrets add stream_new_webhook_signature <MUX_WEBHOOK_SIGNATURE_SECRET>
vercel secrets add stream_new_slack_webhook_ready <SLACK_WEBHOOK_ASSET_READY>
```

### Videos to test:

When developing, if you make any changes to the video player, make sure it works and looks good with videos of various dimensions:

Horizontal

- http://localhost:3000/v/Hi6we01h00uVvZc00GzvVXZW8C02Y8QC8OX7


Vertical

- http://localhost:3000/v/UNDUU7tU7vYt02CRMDTlZd1qKjvk41LN6yI5LbHgtxo8

Super vertical

- http://localhost:3000/v/seK501Bf00kyqSnGdMwQFi3lgqgdoS00qm5PAiV7Yjf2ew

Also be sure to check: Safari, Mobile Safari, Chrome, Firefox because they all behave a little differently.


After all of this is set up the flow will be:

1. Asset is uploaded
1. Mux sends a webhook to your server (NextJS API funciont)
1. (optional) Your server verifies the webhook signature
1. If the webhook matches `video.asset.ready` then your server will post a message to your slack channel that has the Mux Asset ID, the Mux Playback ID, and a thumbnail of the video.

