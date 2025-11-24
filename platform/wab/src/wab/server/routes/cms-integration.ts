import { Request, Response } from "express";
import { jwtAuthMiddleware, generateUserJwtToken, generateJwtToken } from "@/wab/server/auth/jwt-auth";
import { superDbMgr, userDbMgr } from "@/wab/server/routes/util";
import { User, Org, Workspace, Project } from "@/wab/server/entities/Entities";
import { logger } from "@/wab/server/observability";
import { ForbiddenError, BadRequestError } from "@/wab/shared/ApiErrors/errors";

/**
 * API endpoint for CMS integration to generate JWT tokens for users (public)
 * This allows your CMS to authenticate users in Plasmic without requiring session authentication
 */
export async function cmsGenerateTokenPublic(req: Request, res: Response) {
  // Implement API key check instead of session auth for CMS integration
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.CMS_INTEGRATION_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  const { email, user_id, tenant_id } = req.body;
  if (!email) {
    return res.status(400).json({
      error: "email required"
    });
  }
  if (!user_id) {
    return res.status(400).json({
      error: "user_id required"
    });
  }
  if (!tenant_id) {
    return res.status(400).json({
      error: "tenant_id required"
    });
  }

  try {
    // First, create or update the user using superDbMgr (bypasses authentication)
    const superMgr = superDbMgr(req);
    let user = await superMgr.getUserByEmail(email);

    // if not create new user
    if (!user) {
      user = await superMgr.createUser({
        email,
        userId: user_id,
        tenantId: tenant_id,
        needsTeamCreationPrompt: false, // Important: prevents automatic team creation
        needsSurvey: false,
        needsIntroSplash: false,
      });
    }

    if (!user.userId) {
      // Update user with provided user_id if not already set
      user.userId = user_id;
      user.tenantId = tenant_id;
      user = await superMgr.updateUser(user);
    }

    // Add the user to the request so userDbMgr can work properly
    (req as any).user = user;
    const userMgr = userDbMgr(req);

    // Check if user already has an owning team
    let team;
    if (user.owningTeamId) {
      // Use existing team
      team = await userMgr.getTeamById(user.owningTeamId);
    } else {
      // Create team in user context (this should work properly now)
      team = await userMgr.createTeam(`${tenant_id} Team`);

      // Update user to reference the team using super manager
      user.owningTeamId = team.id;
      await superMgr.updateUser(user);
    }

    // Create workspace if not exists in user context
    let workspace;
    workspace = await userMgr.getWorkspacesByTeams([team.id]);

    if (!workspace.length) {
      workspace = await userMgr.createWorkspace({
        name: `${tenant_id} Workspace`,
        description: `Default workspace for ${tenant_id}`,
        teamId: team.id,
      });
    }

    // // Create project if not exists in user context
    // let project;
    // try {
    //   const userProjects = await userMgr.getAffiliatedProjects(team.id);

    //   project = userProjects.find(p => p.workspaceId === workspace.id);
    // } catch (e) {
    //   // If method doesn't exist, continue
    // }

    // if (!project) {
    //   project = await userMgr.createProject({
    //     name: `${tenant_id} Default Project`,
    //     workspaceId: workspace.id,
    //     inviteOnly: false,
    //     defaultAccessLevel: "editor",
    //   });
    // }

    // Generate a JWT token for the specified user
    const token = generateJwtToken(user.id, user.email, user.tenantId || '', user.id)

    res.json({
      user,
      userId: user.id,
      teamId: user.owningTeamId,
      orgId: user.orgId,
      token,
      team: { id: team.id, name: team.name },
      workspace: { id: workspace[0].id, name: workspace[0].name },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  } catch (error) {
    logger().error(`Error generating token for CMS: ${error}`);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * API endpoint to get current user information
 */
export async function cmsGetCurrentUser(req: Request, res: Response) {
  // Authenticate the user via JWT
  await jwtAuthMiddleware(req, res, () => { });

  if (!req.user) {
    return res.status(401).json({
      error: "User not authenticated"
    });
  }

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    }
  });
}

/**
 * API endpoint for CMS integration to generate JWT tokens for workspace access (public)
 * This allows your CMS to authenticate users in Plasmic workspace page without requiring session authentication
 */
export async function cmsGenerateWorkspaceTokenPublic(req: Request, res: Response) {
  // Implement API key check instead of session auth for CMS integration
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.CMS_INTEGRATION_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  const { email, user_id, tenant_id, workspace_id } = req.body;
  if (!email) {
    return res.status(400).json({
      error: "email required"
    });
  }
  if (!user_id) {
    return res.status(400).json({
      error: "user_id required"
    });
  }
  if (!tenant_id) {
    return res.status(400).json({
      error: "tenant_id required"
    });
  }

  try {
    // First, create or update the user using superDbMgr (bypasses authentication)
    const superMgr = superDbMgr(req);
    let user = await superMgr.getUserByEmail(email);

    // if not create new user
    if (!user) {
      user = await superMgr.createUser({
        email,
        userId: user_id,
        tenantId: tenant_id,
        needsTeamCreationPrompt: false, // Important: prevents automatic team creation
        needsSurvey: false,
        needsIntroSplash: false,
      });
    }

    if (!user.userId) {
      // Update user with provided user_id if not already set
      user.userId = user_id;
      user.tenantId = tenant_id;
      await superMgr.updateUser(user);
    }

    // Add the user to the request so userDbMgr can work properly
    (req as any).user = user;
    const userMgr = userDbMgr(req);

    // Check if user already has an owning team
    let team;
    if (user.owningTeamId) {
      // Use existing team
      team = await userMgr.getTeamById(user.owningTeamId);
    } else {
      // Create team in user context (this should work properly now)
      team = await userMgr.createTeam(`${tenant_id} Team`);

      // Update user to reference the team using super manager
      user.owningTeamId = team.id;
      user = await superMgr.updateUser(user);
    }

    // Create or get workspace in user context
    let workspace;
    // Create workspace if not exists in user context
    const userWorkspaces = await userMgr.getAffiliatedWorkspaces();
    workspace = userWorkspaces.find(ws => ws.teamId === team.id);

    if (!workspace) {
      workspace = await userMgr.createWorkspace({
        name: `${tenant_id} Workspace`,
        description: `Default workspace for ${tenant_id}`,
        teamId: team.id,
      });
    }

    // Create project if not exists in user context
    // let project;
    // try {
    //   const userProjects = await userMgr.getAffiliatedProjects(team.id);

    //   project = userProjects.find(p => p.workspaceId === workspace.id);
    // } catch (e) {
    //   // If method doesn't exist, continue
    // }

    // if (!project) {
    //   project = await userMgr.createProject({
    //     name: `${tenant_id} Default Project`,
    //     workspaceId: workspace.id,
    //     inviteOnly: false,
    //     defaultAccessLevel: "editor",
    //   });
    // }

    // Generate a JWT token for the specified user
    const token = generateJwtToken(user.id, user.email, user.tenantId || '', user.id)

    res.json({
      user,
      userId: user.id,
      teamId: user.owningTeamId,
      orgId: user.orgId,
      token,
      team: { id: team.id, name: team.name },
      workspace: { id: workspace.id, name: workspace.name },
      workspaceUrl: workspace_id ? `http://localhost:3003/workspaces/${workspace_id}?token=${token}` : `http://localhost:3003/workspaces/${workspace.id}?token=${token}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  } catch (error) {
    logger().error(`Error generating workspace token for CMS: ${error}`);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}