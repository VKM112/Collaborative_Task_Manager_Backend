"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMessagesHandler = listMessagesHandler;
exports.createMessageHandler = createMessageHandler;
const errors_1 = require("../types/errors");
const events_1 = require("../utils/events");
const message_service_1 = require("../services/message.service");
const team_service_1 = require("../services/team.service");
async function listMessagesHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        const { teamId } = req.params;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        if (!teamId) {
            throw new errors_1.ApiError(400, 'Team id is required.');
        }
        await (0, team_service_1.ensureTeamMembership)(userId, teamId);
        const messages = await (0, message_service_1.listTeamMessages)(teamId);
        res.json({ messages });
    }
    catch (error) {
        next(error);
    }
}
async function createMessageHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        const { teamId } = req.params;
        const { content } = req.body;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        if (!teamId) {
            throw new errors_1.ApiError(400, 'Team id is required.');
        }
        if (!content || !content.trim()) {
            throw new errors_1.ApiError(400, 'Message cannot be empty.');
        }
        await (0, team_service_1.ensureTeamMembership)(userId, teamId);
        const message = await (0, message_service_1.createTeamMessage)({
            content,
            teamId,
            senderId: userId,
        });
        events_1.socketEvents.emit('team:message', { teamId, message });
        res.json({ message });
    }
    catch (error) {
        next(error);
    }
}
