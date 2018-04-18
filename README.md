# O Slack Certo

## Introduction

_O Slack Certo_ is a Slackbot that simulates the widely-known Portuguese late-afternoon show _Preço Certo_. 

The bot allows users to play a small and exciting game of price guessing using random technological products!
The winner is the user with the guest that is closest to the actual price, without actually surpassing it.

To start the game, mention the bot in a channel using `@` and append the [famous word](https://www.youtube.com/watch?v=OMa9iVObGQc) `espetáculo`.

You can also analyse your performance by mentioning the bot and appending `stats`!


## Running

### Run locally or use Glitch
1. Get the code
    * Either clone this repo and run `npm install`
    * Or visit https://glitch.com
1. Set the following environment variables to `.env` (see `.env.sample`):
    * `CLIENT_ID`: Your app's client ID (available on the Basic Information page)
    * `CLIENT_SECRET`: Your app's client secret (available on the Basic Information page)
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
    * `PORT`: The port that you want to run the web server on
1. If you're running the app locally:
    1. Start the app (`npm run dev`)
    1. In another window, start ngrok on the same port as your webserver (`ngrok http $PORT`)
