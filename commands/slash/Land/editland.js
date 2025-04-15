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
        .setName('editland')
        .setDescription('Edita una land existente por ID')
        .addStringOption(option =>
            option.setName('land_id')
                .setDescription('ID de la land a editar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Nuevo tipo')
                .addChoices(
                    { name: "Homestead", value: "Homestead" },
                    { name: "Settlement", value: "Settlement" },
                    { name: "City", value: "City" },
                    { name: "Village", value: "Village" }
                ))
        .addStringOption(option =>
            option.setName('zone')
                .setDescription('Nueva zona'))
        .addStringOption(option =>
            option.setName('blocked')
                .setDescription('¿Está bloqueada?')
                .addChoices(
                    { name: 'Sí', value: 'true' },
                    { name: 'No', value: 'false' }
                ))
        .addStringOption(option =>
            option.setName('city')
                .setDescription('Nueva ciudad'))
        .addStringOption(option =>
            option.setName('district')
                .setDescription('Nuevo distrito'))
        .addStringOption(option =>
            option.setName('resources')
                .setDescription('Nuevos recursos'))
        .addStringOption(option =>
            option.setName('structures')
                .setDescription('Nuevas estructuras')),

    async execute(interaction) {
        const land_id = interaction.options.getString('land_id');
        const fields = {
            type: interaction.options.getString('type'),
            zone: interaction.options.getString('zone'),
            blocked: interaction.options.getString('blocked'),
            city: interaction.options.getString('city'),
            district: interaction.options.getString('district'),
            resources: interaction.options.getString('resources'),
            structures: interaction.options.getString('structures')
        };

        // Validar recursos y estructuras
        const rawResources = fields.resources;
        const rawStructures = fields.structures;

        // Validar recursos
        if (rawResources && !validateResourcesOrStructures(rawResources)) {
            return sendEphemeralMessage(interaction, "❌ Los `recursos` solo pueden contener letras, comas y espacios (sin números).");
        }

        // Validar estructuras
        if (rawStructures && !validateResourcesOrStructures(rawStructures)) {
            return sendEphemeralMessage(interaction, "❌ Las `estructuras` solo pueden contener letras, comas y espacios (sin números).");
        }

        // Limpiar listas
        if (rawResources) {
            fields.resources = cleanList(rawResources);
        }
        if (rawStructures) {
            fields.structures = cleanList(rawStructures);
        }

        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(fields)) {
            if (value !== null && value !== undefined) {
                updates.push(`${key} = ?`);
                values.push(key === 'blocked' ? value === 'true' : value);
            }
        }

        if (updates.length === 0) {
            return sendEphemeralMessage(interaction, '❌ Debes proporcionar al menos un campo para editar.');
        }

        values.push(land_id);

        try {
            const [result] = await database.execute(
                `UPDATE Lands SET ${updates.join(', ')} WHERE land_id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return sendEphemeralMessage(interaction, '❌ No se encontró ninguna land con ese ID.');
            }
            return sendEphemeralMessage(interaction, '✅ Land actualizada correctamente.');
        } catch (error) {
            console.error(error);
            return sendEphemeralMessage(interaction, '❌ Error al actualizar la land.');
        }
    }
};
