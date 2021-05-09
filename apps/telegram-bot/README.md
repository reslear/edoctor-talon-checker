# telegram bot for edoctor talonchecker

1. Go to [BotFather](https://t.me/BotFather) and create new bot, and save token
2. Set environments
    - **Local** - create`.env` file and set your token
      ```env
      BOT_TOKEN=your_token
      ```
    - **Heroku** - go to project `Settings -> Config Vars -> Reveal Config Vars` and insert 

      ```
      KEY: BOT_TOKEN
      VALUE: your_token
      ```

      click `Add` button 
2. 