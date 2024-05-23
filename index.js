const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const rest = new REST({ version: "10" }).setToken(config.token);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Serving ${client.guilds.cache.size} servers.`);

  client.user.setPresence({
    activities: [
      { name: `serving ${client.guilds.cache.size} servers`, type: 3 },
    ],
    status: "online",
  });

  deleteAndRegisterCommands();
});

client.on("interactionCreate", async (interaction) => {
  console.log(
    `Received interaction: ${interaction.type} from ${interaction.user.tag}`
  );
  if (!interaction.isChatInputCommand()) return;

  console.log(
    `Handling command: ${interaction.commandName} by user: ${interaction.user.tag}`
  );

  if (interaction.commandName === config.commandName) {
    try {
      await handleCommand(interaction);
    } catch (error) {
      console.error(`Error handling ${interaction.commandName}:`, error);
      await interaction.reply({
        content: "An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  }
});

async function handleCommand(interaction) {
  const settings = config.features;
  if (interaction.guild.id !== config.guildId) {
    return interaction.reply({
      content: "This bot is configured for a specific server only.",
      ephemeral: true,
    });
  }

  const order = interaction.options.getString("order");
  const roles = interaction.guild.roles.cache.filter(
    (role) =>
      (!role.managed || !settings.ignoreBotOwnedRoles) &&
      role.id !== interaction.guild.id &&
      !(
        settings.enableExclusionWords &&
        settings.exclusionWords.some((exWord) => role.name.includes(exWord))
      ) &&
      !(
        settings.enableExcludedRoleIds &&
        settings.excludedRoleIds.includes(role.id)
      )
  );

  const sortedRoles = [...roles.values()].sort(
    (a, b) => a.position - b.position
  );
  if (order === "descending") sortedRoles.reverse();

  const roleListLua = formatRolesToLua(sortedRoles, settings);
  await fs.writeFile(
    path.join(__dirname, `roles-${interaction.guild.id}.lua`),
    roleListLua
  );
  interaction.reply({
    content: `Role list has been saved to roles-${interaction.guild.id}.lua in ${order} order.`,
    ephemeral: config.replyEphemeral,
  });
}

function formatRolesToLua(roles, settings) {
  return (
    roles.reduce((luaString, role) => {
      const roleName = role.name.replace(/[^\w\s]/gi, '');
      let formattedName = `"${roleName.toLowerCase().replace(/ /g, "")}"`;
      if (
        settings.enableRolePrefix &&
        roleName.startsWith(settings.rolePrefix)
      ) {
        const specificPart = roleName.split(settings.rolePrefix)[1];
        formattedName = `"${specificPart.toLowerCase().replace(/ /g, "")}"`;
      }
      return `${luaString}['${roleName.toLowerCase().replace(/ /g, "")}'] = '${role.id}', -- ${role.name}\n`;
    }, "// Role permissions\n") + "// End of role permissions\n"
  );
}

async function deleteAndRegisterCommands() {
  console.log("Checking for existing slash (/) commands.");

  try {
    if (
      !config.clientId ||
      !config.token ||
      !config.guildId ||
      !config.commandName ||
      typeof config.replyEphemeral !== "boolean" ||
      !config.features ||
      typeof config.features.enableRolePrefix !== "boolean" ||
      !Array.isArray(config.features.exclusionWords) ||
      typeof config.features.ignoreBotOwnedRoles !== "boolean"
    ) {
      throw new Error("Invalid configuration in config.json");
    }

    const existingCommands = await rest.get(
      Routes.applicationGuildCommands(config.clientId, config.guildId)
    );
    const existingCommandsMap = new Map(
      existingCommands.map((cmd) => [cmd.name, cmd])
    );

    const newCommands = [
      {
        name: config.commandName,
        description: "Retrieve and sort roles, then save to a Lua file.",
        options: [
          {
            type: 3,
            name: "order",
            description: "Choose the order of the roles",
            required: true,
            choices: [
              { name: "ascending", value: "ascending" },
              { name: "descending", value: "descending" },
            ],
          },
        ],
      },
    ];

    const toRegister = newCommands.filter(
      (cmd) =>
        !existingCommandsMap.has(cmd.name) ||
        existingCommandsMap.get(cmd.name).description !== cmd.description ||
        JSON.stringify(existingCommandsMap.get(cmd.name).options) !==
          JSON.stringify(cmd.options)
    );

    if (toRegister.length > 0) {
      console.log("Updating slash (/) commands...");
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: toRegister }
      );
      console.log("Successfully registered slash (/) commands.");
    } else {
      console.log("No changes to slash (/) commands needed.");
    }
  } catch (error) {
    console.error("Failed to update commands:", error);
  }
}

console.log("Don't forget to turn me off! After you're done!");

client.login(config.token);
