# telegram bot for edoctor talonchecker

1. Go to [BotFather](https://t.me/BotFather) and create new bot, and save token
2. Set environments

   - **Local** - create`.env` file and set your token
     ```env
     BOT_TOKEN=your_token
     ```
   - **Heroku** - go to project `Settings -> Config Vars -> Reveal Config Vars` and insert

     | KEY         | VALUE                          |
     | ----------- | ------------------------------ |
     | BOT_TOKEN   | your_token                     |
     | WEBHOOK_URL | https://your_url.herokuapp.com |

3. For pinging your Heroku app, will never go to sleep, use:
   - http://kaffeine.herokuapp.com
   - http://wakemydyno.com
