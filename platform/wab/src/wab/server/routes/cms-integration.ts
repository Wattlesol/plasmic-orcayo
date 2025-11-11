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
      await superMgr.updateUser(user);
    }
    
    // Create workspace if not exists in user context
    let workspace;
    try {
      const userWorkspaces = await userMgr.getAffiliatedWorkspaces();
      workspace = userWorkspaces.find(ws => ws.teamId === team.id);
    } catch (e) {
      // If method doesn't exist, continue
    }
    
    if (!workspace) {
      workspace = await userMgr.createWorkspace({
        name: `${tenant_id} Workspace`,
        description: `Default workspace for ${tenant_id}`,
        teamId: team.id,
      });
    }
    
    // Create project if not exists in user context
    let project;
    try {
      const userProjects = await userMgr.getAffiliatedProjects();
      project = userProjects.find(p => p.workspaceId === workspace.id);
    } catch (e) {
      // If method doesn't exist, continue
    }
    
    if (!project) {
      project = await userMgr.createProject({
        name: `${tenant_id} Default Project`,
        workspaceId: workspace.id,
        inviteOnly: false,
        defaultAccessLevel: "editor",
      });
    }

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
      project: { id: project.id, name: project.name },
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
 * Simplified API endpoint for creating users with just an ID
 * This allows CMS systems to create users without requiring email, password, first name, or last name
 */
export async function cmsCreateUserWithIdOnly(req: Request, res: Response) {
  // Implement API key check instead of session auth for CMS integration
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.CMS_INTEGRATION_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      error: "id is required"
    });
  }

  try {
    const mgr = superDbMgr(req);

    // Create a new user with just an ID, using placeholder values for required fields
    const email = `${id}@data.com`; // Generate a placeholder email
    const firstName = id; // Use the ID as first name
    const lastName = "ID"; // Default last name

    // Check if a user with this email already exists to avoid duplicates
    const existingUser = await mgr.tryGetUserByEmail(email);
    if (existingUser) {
      // If user already exists with this email, return existing user with a new token
      const token = generateUserJwtToken(existingUser.id, existingUser.email, existingUser.firstName || "User", existingUser.lastName || "ID");

      logger().info(`CMS used existing user with email: ${email} (ID: ${id})`);

      return res.json({
        user: {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          avatarUrl: existingUser.avatarUrl,
          needsIntroSplash: existingUser.needsIntroSplash,
          needsSurvey: existingUser.needsSurvey,
          waitingEmailVerification: existingUser.waitingEmailVerification,
        },
        token: token,
        message: "User already existed, returning existing user"
      });
    }

    // Create user with generated values
    const user = await mgr.createUser({
      email,
      firstName,
      lastName,
      needsTeamCreationPrompt: false, // Skip team creation prompt
      needsSurvey: false, // Skip survey
      needsIntroSplash: false, // Skip intro splash
    });

    // We'll use the generated user ID but still generate token based on the requested ID for consistency
    // Generate a JWT token for the new user
    const token = generateUserJwtToken(user.id, user.email, user.firstName, user.lastName);

    logger().info(`CMS created new user with ID: ${user.id} (requested ID: ${id})`);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        needsIntroSplash: user.needsIntroSplash,
        needsSurvey: user.needsSurvey,
        waitingEmailVerification: user.waitingEmailVerification,
      },
      token: token,
      requestedId: id, // Include the ID the user requested
      message: "User created successfully"
    });
  } catch (error) {
    logger().error(`Error creating user with ID for CMS: ${error}`);
    res.status(500).json({
      message: "Internal server error during user creation",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Simplified API endpoint for authenticating users with just an ID
 * This allows CMS systems to authenticate users without requiring email, password, etc.
 */
export async function cmsAuthenticateUserById(req: Request, res: Response) {
  // Implement API key check instead of session auth for CMS integration
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.CMS_INTEGRATION_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      error: "id is required"
    });
  }

  try {
    const mgr = superDbMgr(req);

    // Try to find the user by email (since we created users with email based on ID)
    const email = `${id}@example.com`;
    const user = await mgr.tryGetUserByEmail(email);

    if (!user) {
      // If user doesn't exist, create a new one automatically
      return res.status(404).json({
        error: "User not found. You need to create the user first using /create-user endpoint."
      });
    }

    // Generate a JWT token for the existing user
    const token = generateUserJwtToken(user.id, user.email, user.firstName, user.lastName);

    logger().info(`CMS authenticated user with ID: ${id} (email: ${email})`);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        needsIntroSplash: user.needsIntroSplash,
        needsSurvey: user.needsSurvey,
        waitingEmailVerification: user.waitingEmailVerification,
      },
      token: token
    });
  } catch (error) {
    logger().error(`Error authenticating user by ID for CMS: ${error}`);
    res.status(500).json({
      message: "Internal server error during authentication",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}