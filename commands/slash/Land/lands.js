require('module-alias/register');
const { SlashCommandBuilder } = require("discord.js");
const database = require("@database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lands")
        .setDescription("Busca lands con filtros avanzados y opción de limitar resultados.")
        .addStringOption(option =>
            option.setName("land_id")
                .setDescription("Buscar por ID exacto de land"))
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Filtrar por usuario que registró la land"))
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Filtrar por tipo")
                .addChoices(
                    { name: "Homestead", value: "Homestead" },
                    { name: "Settlement", value: "Settlement" },
                    { name: "City", value: "City" },
                    { name: "Village", value: "Village" }
                ))
        .addStringOption(option =>
            option.setName("zone")
                .setDescription("Filtrar por zona"))
        .addStringOption(option =>
            option.setName("blocked")
                .setDescription("¿Está bloqueada?")
                .addChoices(
                    { name: "Sí", value: "true" },
                    { name: "No", value: "false" }
                ))
        .addStringOption(option =>
            option.setName("city")
                .setDescription("Filtrar por ciudad"))
        .addStringOption(option =>
            option.setName("district")
                .setDescription("Filtrar por distrito"))
        .addStringOption(option =>
            option.setName("resources")
                .setDescription("Buscar recurso (coincidencia parcial)"))
        .addStringOption(option =>
            option.setName("structures")
                .setDescription("Buscar estructura (coincidencia parcial)"))
        .addIntegerOption(option =>
            option.setName("limit")
                .setDescription("Número máximo de resultados a mostrar (por defecto: 10)")),

    async execute(interaction) {
        const filters = {
            land_id: interaction.options.getString("land_id"),
            user_id: interaction.options.getUser("user")?.id,
            type: interaction.options.getString("type"),
            zone: interaction.options.getString("zone"),
            blocked: interaction.options.getString("blocked"),
            city: interaction.options.getString("city"),
            district: interaction.options.getString("district"),
            resources: interaction.options.getString("resources")?.toLowerCase(),
            structures: interaction.options.getString("structures")?.toLowerCase(),
            limit: interaction.options.getInteger("limit") ?? 10
        };

        const whereClauses = [];
        const values = [];

        if (filters.land_id) {
            whereClauses.push("land_id = ?");
            values.push(filters.land_id);
        }
        if (filters.user_id) {
            whereClauses.push("user_id = ?");
            values.push(filters.user_id);
        }
        if (filters.type) {
            whereClauses.push("type = ?");
            values.push(filters.type);
        }
        if (filters.zone) {
            whereClauses.push("zone = ?");
            values.push(filters.zone);
        }
        if (filters.blocked !== undefined) {
            whereClauses.push("blocked = ?");
            values.push(filters.blocked === "true");
        }
        if (filters.city) {
            whereClauses.push("city = ?");
            values.push(filters.city);
        }
        if (filters.district) {
            whereClauses.push("district = ?");
            values.push(filters.district);
        }
        if (filters.resources) {
            whereClauses.push("LOWER(resources) LIKE ?");
            values.push(`%${filters.resources}%`);
        }
        if (filters.structures) {
            whereClauses.push("LOWER(structures) LIKE ?");
            values.push(`%${filters.structures}%`);
        }

        const query = `
            SELECT * FROM lands
            ${whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : ""}
            LIMIT ?
        `;

        values.push(filters.limit);

        const [results] = await database.query(query, values);

        if (results.length === 0) {
            return await interaction.reply("🔍 No se encontraron lands que coincidan con los filtros especificados.");
        }

        const list = results.map(land =>
            `• **ID:** ${land.land_id} | Tipo: ${land.type} | Zona: ${land.zone} | Ciudad: ${land.city} | Recursos: ${land.resources} | Usuario: <@${land.user_id}>`
        ).join("\n");

        await interaction.reply({ content: list });
    }
};