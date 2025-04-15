require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
const { sendEphemeralMessage } = require('@messageService');

// Limpia listas tipo: "wood,berries, water" → "wood, berries, water"
function cleanList(input) {
    return input
        .split(",")
        .map(item => item.trim().toLowerCase())
        .join(", ");
}

// Valida si la cadena solo contiene letras, comas y espacios (sin números)
function validateResourcesOrStructures(input) {
    // Permitir solo letras, comas y espacios
    const regex = /^[a-zA-Z\s,]+$/;
    return regex.test(input);
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
            return sendEphemeralMessage(interaction, "❌ El `land_id` debe contener **solo números**. No se permiten letras, espacios ni símbolos.")
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

        // Obtener recursos y estructuras
        const rawResources = interaction.options.getString("resources");
        const rawStructures = interaction.options.getString("structures");

        // Validar recursos
        if (!validateResourcesOrStructures(rawResources)) {
            return sendEphemeralMessage(interaction, "❌ Los `recursos` solo pueden contener letras, comas y espacios (sin números).")
        }

        // Validar estructuras
        if (!validateResourcesOrStructures(rawStructures)) {
            return sendEphemeralMessage(interaction, "❌ Las `estructuras` solo pueden contener letras, comas y espacios (sin números).")
        }

        // Limpiar listas
        const resources = cleanList(rawResources);
        const structures = cleanList(rawStructures);

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
        return sendEphemeralMessage(interaction, "✅ Tu land fue registrada correctamente.")
    }
};
