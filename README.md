## Introduction
This Discord bot is made for scully_perms. It helps automatically setup your [Permissions](https://github.com/Scullyy/scully_perms/blob/5d054cbaad8c70944d7f8f5649d12f12b16a10cf/config.lua#L5-L8) on FiveM (scully_perms). Instead of setting up a list of roles manually, this bot does it for you.

## How It Works
The bot sorts roles from lowest to highest or highest to lowest, then saves them in a file. This makes handling roles easier with FiveM Ace Permissions.

## Features
- Automatically sorts roles
- Choose whether roles go up or down
- Saves sorted roles in a file
- Many configuration options
- Checks to ensure "perm" has a valid name, for example, removing special characters!

## Getting Started
To use the bot, follow these steps:
1. Download the bot's code to your computer.
2. Install necessary packages by typing `npm install`.
3. Create a Discord bot and get its ID and token.
4. Put your bot's ID, token, server ID, and what you want the bot to listen for in `config.json`.
5. Customize other settings in `config.json` if needed.
6. Invite the bot to your Discord server using a link from Discord's website.
7. Activate the bot by typing `node index.js` in your computer's command line.

## Commands
The bot has one command:
- `/command_name_no_spaces_or_special_characters`: This command fetches and sorts roles, then saves them to a file. **Make sure to change the command name in the [configuration](config.json)!**

## Contributing
You can help improve the bot! If you find issues or have ideas, let us know by opening an issue or sending changes with a pull request.

## Credits
This bot was inspired by the [scully_perms](https://github.com/scullyy/scully_perms) project by [Scully](https://github.com/scullyy/).

## License
This project is licensed under the [MIT License](LICENSE).