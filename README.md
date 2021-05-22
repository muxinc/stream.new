# stream.new

This example uses Mux Video Direct Uploads and NextJS. This is a functioning application at https://stream.new. Feel free to use it!

## Demo

### [https://stream.new/](https://stream.new/)

## Note

This example uses:

Mux:

- [Direct uploads](https://docs.mux.com/docs/direct-upload) - this is an API for uploading video files from a client to create Mux Assets
- [Webhook signature verification](https://docs.mux.com/docs/webhook-security) - webhook signature verification to make sure Mux webhooks are coming from a trusted source
- [HLS.js](https://github.com/video-dev/hls.js/) - for doing HLS video playback of videos
- [Mux Data](https://docs.mux.com/docs/data) - for tracking video quality metrics.

**Slackbot moderator**. This examples allows you to configure a `SLACK_WEBHOOK_ASSET_READY`. When a new Mux asset is `ready`, an Incoming Webhook for slack will be sent. This is an example of how you might integrate a Slack channel that can be used to moderate content. The Slack message contains the asset ID, playback ID and a storyboard of thumbnails from the video.

![Slackbot message](screenshots/slackbot-moderator.png)

NextJS:

- [SWR](https://swr.now.sh/) — dynamically changing the `refreshInterval` depending on if the client should be polling for updates or not
- [`/pages/api`](pages/api) routes — a couple endpoints for making authenticated requests to the Mux API.
- Dynamic routes using [`getStaticPaths` and `fallback: true`](https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation), as well as dynamic API routes.

This app was created with the [NextJS `with-mux-video` example](https://github.com/vercel/next.js/tree/canary/examples/with-mux-video) as a starting point.

# Step 1. Create an account in Mux

All you need to set this up is a [Mux account](https://mux.com). You can sign up for free and pricing is pay-as-you-go. There are no upfront charges, you get billed monthly only for what you use.

Without entering a credit card on your Mux account all videos are in “test mode” which means they are watermarked and clipped to 10 seconds. If you enter a credit card all limitations are lifted and you get \$20 of free credit. The free credit should be plenty for you to test out and play around with everything before you are charged.

# Step 2. Set up environment variables

Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

Then, go to the [settings page](https://dashboard.mux.com/settings/access-tokens) in your Mux dashboard, get a new **API Access Token** that allows for "Full Access" against Mux Video and set each variable in `.env.local`:

- `MUX_TOKEN_ID` should be the `TOKEN ID` of your new token
- `MUX_TOKEN_SECRET` should be `TOKEN SECRET`
- `MUX_WEBHOOK_SIGNATURE_SECRET` (optional) - the webhook signing secret if you set up webhooks (see below)
- `SLACK_WEBHOOK_ASSET_READY` (optional) - the slack webhook URL that will be used for the **Slackbot moderator** feature (see below)
- `SLACK_MODERATOR_PASSWORD` (optional) - this is the password when you want to take actions from the **Slackbot moderator** feature (see below)
- `NEXT_PUBLIC_MUX_ENV_KEY` (optional) - this is the mux environment key for Mux Data integration

# Step 3. Deploy on Vercel

You can deploy this app to the cloud with [Vercel](https://vercel.com/import?filter=next.js&utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

To deploy on Vercel, you need to set the environment variables using [Vercel CLI](https://vercel.com/download) ([Documentation](https://vercel.com/docs/cli#commands/secrets)).

Install the [Vercel CLI](https://vercel.com/download), log in to your account from the CLI, and run the following commands to add the environment variables. Replace the values with the corresponding strings in `.env.local`:

```bash
vercel secrets add stream_new_token_id <MUX_TOKEN_ID>
vercel secrets add stream_new_token_secret <MUX_TOKEN_SECRET>
```

Then push the project to GitHub/GitLab/Bitbucket and [import to Vercel](https://vercel.com/import?filter=next.js&utm_source=github&utm_medium=readme&utm_campaign=next-example) to deploy.

# Step 4 (optional) Slackbot Moderator

![Slackbot message](screenshots/slackbot-moderator.png)

This application uses a slackbot to send message to a slack channel every time a new asset is ready for playback. This requires a few steps for setup.

First, login to your Mux dashboard and in the left sidebar navigation find Settings > Webhooks. Create a new webhook and makes sure you are creating a webhook for the environment that matches the access token that you are using.

![Mux Webhook Create](screenshots/mux-webhook-create.png)

For local development you may want to use a tool [like ngrok](https://ngrok.com/) to receive webhooks on localhost. The route for the webhook handler is `/api/webhooks/mux` (defined in this NextJS app under `./pages/api/webhooks/mux`).

Create a Slack 'Incoming Webhook'. Configure the channel you want to post to, the icon, etc.

![Slack Incoming Webhook](screenshots/incoming-webhook.png)

When you're done with this, you should have a slack webhook URL that looks something like `https://hooks.slack.com/services/...`.

Set the optional environment variables either directly in the vercel UI or by updating `vercel.json` and setting them as secrets for your organization. The optional environment variables are:

- `MUX_WEBHOOK_SIGNATURE_SECRET` - This is a security mechanism that checks the webhook signature header when the request hits your server so that your server can verify that the webhook came from Mux. Read more about [webhook signature verification](https://docs.mux.com/docs/webhook-security). Note that in `./pages/api/webhooks/mux` the code will only verify the signature if you have set a signature secret variable, so this step is optional.
- `SLACK_WEBHOOK_ASSET_READY` - This is the `https://hooks.slack.com/services/....` URL when you created the Slack Incoming Webhook.
- `SLACK_MODERATOR_PASSWORD` - This is the password that will be used to authorize deleting assets from the slack moderator (The button with the red text "DELETE (cannot be undone)")
- `NEXT_PUBLIC_MUX_ENV_KEY` - This is the env key to use with [Mux Data](https://docs.mux.com/docs/data). Note this is different than your API key and this environment key can be found on your [environment page in the Mux dashboard](https://dashboard.mux.com/environments)

After all of this is set up the flow will be:

1. Asset is uploaded
1. Mux sends a webhook to your server (NextJS API function)
1. (optional) Your server verifies the webhook signature
1. If the webhook matches `video.asset.ready` then your server will post a message to your slack channel that has the Mux Asset ID, the Mux Playback ID, and a thumbnail of the video.

# Step 5 (optional) Add automatic content analysis to Slackbot Moderator

stream.new can automatically moderate content with the help of Google's [Cloud vision API](https://cloud.google.com/vision).

Follow these steps to help moderate uploaded content:

- `GOOGLE_APPLICATION_CREDENTIALS` - This is a base64 encoded JSON representation of your Google service account credentials. Follow instructions below.

1. First, you will need to set up a google developer account at [cloud.google.com](https://cloud.google.com/).
1. Create a project
1. Create a service account for your project and enable the "Cloud Vision API" for your project

Export a Google Service Account authentication file in JSON format. If you have a file that is like this:

`service_account.json`

```
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "-----BEGIN PRIVATE KEY-----\",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": ""
}
```

Get the base64 encoded string of this JSON file like so:

```
cat service-account.json | base64
```

^ This command will output one long string. This string is what you will use for the ENV var `GOOGLE_APPLICATION_CREDENTIALS`.

When the Slackbot Moderator message gets posted to slack, it will now include a "Moderation Score" with 3 dimensions:

* `"adult"`
* `"racy"`
* `"violence"`

Each dimension will have a score from 1-5. You should interpret these scores in terms of likelihood that the video contains this type of content.

* `1`: very unlikely
* `2`: unlikely
* `3`: possible
* `4`: likely
* `5`: very likely


![Slackbot message](screenshots/moderation-score-slack.png)


### Videos to test in development:

When developing, if you make any changes to the video player, make sure it works and looks good with videos of various dimensions:

Horizontal

- http://localhost:3000/v/Hi6we01h00uVvZc00GzvVXZW8C02Y8QC8OX7

Vertical

- http://localhost:3000/v/UNDUU7tU7vYt02CRMDTlZd1qKjvk41LN6yI5LbHgtxo8

Super vertical

- http://localhost:3000/v/seK501Bf00kyqSnGdMwQFi3lgqgdoS00qm5PAiV7Yjf2ew

Also be sure to check: Safari, Mobile Safari, Chrome, Firefox because they all behave a little differently.
