# telegram bot for edoctor talon checker

![](./assets/screenshot.png)

1. Go to [BotFather](https://t.me/BotFather) and create new bot, and save token
2. Set environments

   - **Local**

     1. create`.env` file and set `BOT_TOKEN` your token.
     2. Generate ssl url `npx localtunnel --port 5000` and set `WEBHOOK_URL`

     ```env
     BOT_TOKEN=your_token
     WEBHOOK_URL=https://smooth-mule-98.loca.lt
     ```

   - **Heroku** - go to project `Settings -> Config Vars -> Reveal Config Vars` and insert

     | KEY         | VALUE                          |
     | ----------- | ------------------------------ |
     | BOT_TOKEN   | your_token                     |
     | WEBHOOK_URL | https://your_url.herokuapp.com |

3. For pinging your Heroku app, will never go to sleep, use:
   - http://kaffeine.herokuapp.com
   - http://wakemydyno.com
