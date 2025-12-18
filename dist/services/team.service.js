"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTeamsForUser = listTeamsForUser;
exports.getTeamById = getTeamById;
exports.getTeamMember = getTeamMember;
exports.ensureTeamMembership = ensureTeamMembership;
exports.ensureTeamRole = ensureTeamRole;
exports.createTeam = createTeam;
exports.updateTeam = updateTeam;
exports.deleteTeam = deleteTeam;
exports.listTeamMembers = listTeamMembers;
exports.removeTeamMember = removeTeamMember;
exports.joinTeam = joinTeam;
exports.leaveTeam = leaveTeam;
exports.countTeamOwners = countTeamOwners;
exports.canManageMembership = canManageMembership;
exports.isOwner = isOwner;
exports.isRoleAtLeast = isRoleAtLeast;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../types/errors");
const ROLE_PRIORITY = {
    MEMBER: 0,
    ADMIN: 1,
    OWNER: 2,
};
async function createUniqueInviteCode() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const next = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
        const existing = await prisma_1.default.team.findUnique({ where: { inviteCode: next } });
        if (!existing) {
            return next;
        }
    }
    throw new errors_1.ApiError(500, 'Unable to generate a unique invite code. Try again.');
}
async function listTeamsForUser(userId) {
    return prisma_1.default.team.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
}
async function getTeamById(teamId) {
    return prisma_1.default.team.findUnique({
        where: { id: teamId },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: {
                    role: 'desc',
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}
async function getTeamMember(teamId, userId) {
    return prisma_1.default.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId,
                userId,
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
        },
    });
}
async function ensureTeamMembership(userId, teamId) {
    const membership = await prisma_1.default.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId,
                userId,
            },
        },
    });
    if (!membership) {
        throw new errors_1.ApiError(403, 'You must be a member of this team.');
    }
    return membership;
}
async function ensureTeamRole(userId, teamId, requiredRoles) {
    const membership = await ensureTeamMembership(userId, teamId);
    const hasPermission = requiredRoles.some((role) => membership.role === role);
    if (!hasPermission) {
        throw new errors_1.ApiError(403, 'You need additional permissions for that action.');
    }
    return membership;
}
async function createTeam(data) {
    const inviteCode = await createUniqueInviteCode();
    return prisma_1.default.team.create({
        data: {
            name: data.name.trim(),
            description: data.description?.trim(),
            inviteCode,
            createdById: data.createdById,
            members: {
                create: {
                    userId: data.createdById,
                    role: 'OWNER',
                },
            },
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
    });
}
async function updateTeam(teamId, data) {
    return prisma_1.default.team.update({
        where: { id: teamId },
        data: {
            name: data.name?.trim(),
            description: data.description?.trim(),
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });
}
async function deleteTeam(teamId) {
    return prisma_1.default.$transaction([
        prisma_1.default.task.deleteMany({ where: { teamId } }),
        prisma_1.default.message.deleteMany({ where: { teamId } }),
        prisma_1.default.teamMember.deleteMany({ where: { teamId } }),
        prisma_1.default.team.delete({ where: { id: teamId } }),
    ]);
}
async function listTeamMembers(teamId) {
    return prisma_1.default.teamMember.findMany({
        where: { teamId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
        },
        orderBy: {
            role: 'desc',
        },
    });
}
async function removeTeamMember(teamId, memberId) {
    return prisma_1.default.teamMember.delete({
        where: {
            teamId_userId: {
                teamId,
                userId: memberId,
            },
        },
    });
}
async function joinTeam({ userId, teamId, inviteCode, }) {
    if (!teamId && !inviteCode) {
        throw new errors_1.ApiError(400, 'Team identifier or invite code is required.');
    }
    const team = teamId
        ? await prisma_1.default.team.findUnique({ where: { id: teamId } })
        : await prisma_1.default.team.findUnique({ where: { inviteCode } });
    if (!team) {
        throw new errors_1.ApiError(404, 'Team not found.');
    }
    if (inviteCode && team.inviteCode !== inviteCode) {
        throw new errors_1.ApiError(400, 'Invalid invite code.');
    }
    const membership = await prisma_1.default.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId: team.id,
                userId,
            },
        },
    });
    if (membership) {
        return team;
    }
    await prisma_1.default.teamMember.create({
        data: {
            teamId: team.id,
            userId,
        },
    });
    return team;
}
async function leaveTeam(teamId, userId) {
    const membership = await ensureTeamMembership(userId, teamId);
    if (membership.role === 'OWNER') {
        const ownerCount = await prisma_1.default.teamMember.count({
            where: {
                teamId,
                role: 'OWNER',
            },
        });
        if (ownerCount <= 1) {
            throw new errors_1.ApiError(400, 'Transfer ownership before leaving this team.');
        }
    }
    return removeTeamMember(teamId, userId);
}
async function countTeamOwners(teamId) {
    return prisma_1.default.teamMember.count({
        where: {
            teamId,
            role: 'OWNER',
        },
    });
}
function canManageMembership(role) {
    return role === 'ADMIN' || role === 'OWNER';
}
function isOwner(role) {
    return role === 'OWNER';
}
function isRoleAtLeast(current, required) {
    return ROLE_PRIORITY[current] >= ROLE_PRIORITY[required];
}
