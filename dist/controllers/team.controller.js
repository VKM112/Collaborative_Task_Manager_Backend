"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTeamsHandler = listTeamsHandler;
exports.getTeamHandler = getTeamHandler;
exports.createTeamHandler = createTeamHandler;
exports.updateTeamHandler = updateTeamHandler;
exports.deleteTeamHandler = deleteTeamHandler;
exports.joinTeamHandler = joinTeamHandler;
exports.leaveTeamHandler = leaveTeamHandler;
exports.listMembersHandler = listMembersHandler;
exports.removeMemberHandler = removeMemberHandler;
const client_1 = require("@prisma/client");
const errors_1 = require("../types/errors");
const team_service_1 = require("../services/team.service");
async function listTeamsHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        const teams = await (0, team_service_1.listTeamsForUser)(userId);
        res.json({ teams });
    }
    catch (error) {
        next(error);
    }
}
async function getTeamHandler(req, res, next) {
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
        const team = await (0, team_service_1.getTeamById)(teamId);
        if (!team) {
            throw new errors_1.ApiError(404, 'Team not found.');
        }
        res.json({ team });
    }
    catch (error) {
        next(error);
    }
}
async function createTeamHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        const team = await (0, team_service_1.createTeam)({
            createdById: userId,
            name: req.body.name,
            description: req.body.description,
        });
        res.json({ team });
    }
    catch (error) {
        next(error);
    }
}
async function updateTeamHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        const { teamId } = req.params;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        if (!teamId) {
            throw new errors_1.ApiError(400, 'Team id is required.');
        }
        await (0, team_service_1.ensureTeamRole)(userId, teamId, [client_1.MembershipRole.ADMIN, client_1.MembershipRole.OWNER]);
        const team = await (0, team_service_1.updateTeam)(teamId, {
            name: req.body.name,
            description: req.body.description,
        });
        res.json({ team });
    }
    catch (error) {
        next(error);
    }
}
async function deleteTeamHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        const { teamId } = req.params;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        if (!teamId) {
            throw new errors_1.ApiError(400, 'Team id is required.');
        }
        await (0, team_service_1.ensureTeamRole)(userId, teamId, [client_1.MembershipRole.OWNER]);
        await (0, team_service_1.deleteTeam)(teamId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
async function joinTeamHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        const team = await (0, team_service_1.joinTeam)({
            userId,
            teamId: req.body.teamId,
            inviteCode: req.body.inviteCode,
        });
        const hydrated = await (0, team_service_1.getTeamById)(team.id);
        if (!hydrated) {
            throw new errors_1.ApiError(404, 'Team not found after joining.');
        }
        res.json({ team: hydrated });
    }
    catch (error) {
        next(error);
    }
}
async function leaveTeamHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        const { teamId } = req.params;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        if (!teamId) {
            throw new errors_1.ApiError(400, 'Team id is required.');
        }
        await (0, team_service_1.leaveTeam)(teamId, userId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
async function listMembersHandler(req, res, next) {
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
        const members = await (0, team_service_1.listTeamMembers)(teamId);
        res.json({ members });
    }
    catch (error) {
        next(error);
    }
}
async function removeMemberHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        const { teamId, memberId } = req.params;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Unauthorized');
        }
        if (!teamId || !memberId) {
            throw new errors_1.ApiError(400, 'Team id and member id are required.');
        }
        const membership = await (0, team_service_1.ensureTeamRole)(userId, teamId, [client_1.MembershipRole.ADMIN, client_1.MembershipRole.OWNER]);
        if (!membership) {
            throw new errors_1.ApiError(403, 'Membership required.');
        }
        if (membership.userId === memberId) {
            throw new errors_1.ApiError(400, 'Use the leave endpoint to remove yourself.');
        }
        const target = await (0, team_service_1.getTeamMember)(teamId, memberId);
        if (!target) {
            throw new errors_1.ApiError(404, 'Member not found.');
        }
        if (target.role === 'OWNER') {
            const ownerCount = await (0, team_service_1.countTeamOwners)(teamId);
            if (ownerCount <= 1) {
                throw new errors_1.ApiError(400, 'Transfer ownership before removing the last owner.');
            }
        }
        await (0, team_service_1.removeTeamMember)(teamId, memberId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
