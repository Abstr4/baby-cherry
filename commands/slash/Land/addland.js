require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');

// Limpia listas tipo: "wood,berries, water" → "wood, berries, water"
function cleanList(input) {
    return input
        .split(",")
        .map(item => item.trim().toLowerCase())
        .join(", ");
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addland")
        .setDescription("Agrega una nueva land.")
        .addStringOption(option =>
            option.setName("land_id")
                .setDescription("ID numérico único de la land")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Tipo de land")
                .setRequired(true)
                .addChoices(
                    { name: "Homestead", value: "Homestead" },
                    { name: "Settlement", value: "Settlement" },
                    { name: "City", value: "City" },
                    { name: "Village", value: "Village" }
                ))
        .addStringOption(option =>
            option.setName("zone")
                .setDescription("Zona")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("blocked")
                .setDescription("¿Está bloqueada?")
                .setRequired(true)
                .addChoices(
                    { name: "Sí", value: "true" },
                    { name: "No", value: "false" }
                ))
        .addStringOption(option =>
            option.setName("city")
                .setDescription("Ciudad")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("district")
                .setDescription("Distrito")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("resources")
                .setDescription("Recursos separados por coma")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("structures")
                .setDescription("Estructuras separadas por coma")
                .setRequired(true)),

    async execute(interaction) {
        const landId = interaction.options.getString("land_id").trim();
        const userId = interaction.user.id;
        
        // Validar que el land_id contenga solo números
        if (!/^\d+$/.test(landId)) {
            return await interaction.reply({
                content: "❌ El `land_id` debe contener **solo números**. No se permiten letras, espacios ni símbolos.",
                flags: 64
            });
        }

        // Validar unicidad de land_id
        const [existing] = await database.query(
            "SELECT id FROM Lands WHERE land_id = ?",
            [landId]
        );

        if (existing.length > 0) {
            return await interaction.reply({
                content: "❌ La Land `land_id` ya está registrada.",
                flags: 64
            });
        }

        // Limpiar listas
        const resources = cleanList(interaction.options.getString("resources"));
        const structures = cleanList(interaction.options.getString("structures"));

        // Convertir string a booleano
        const blocked = interaction.options.getString("blocked") === "true";

        // Insertar en base de datos
        await database.query(
            `INSERT INTO Lands (land_id, user_id, type, zone, blocked, city, district, resources, structures)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                landId,
                userId,
                interaction.options.getString("type"),
                interaction.options.getString("zone"),
                blocked,
                interaction.options.getString("city"),
                interaction.options.getString("district"),
                resources,
                structures
            ]
        );

        await interaction.reply("✅ Tu land fue registrada correctamente.");
    }
};