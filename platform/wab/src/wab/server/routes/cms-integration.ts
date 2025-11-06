import { Request, Response } from "express";
import { jwtAuthMiddleware, generateUserJwtToken } from "@/wab/server/auth/jwt-auth";
import { superDbMgr } from "@/wab/server/routes/util";
import { User } from "@/wab/server/entities/Entities";
import { logger } from "@/wab/server/observability";
import { ForbiddenError } from "@/wab/shared/ApiErrors/errors";

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

  const { userId, email, firstName, lastName } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ 
      error: "userId and email are required" 
    });
  }

  try {
    // Verify that the user exists in the database
    const mgr = superDbMgr(req);
    const user = await mgr.getUserById(userId);

    if (!user) {
      return res.status(404).json({ 
        error: `User with ID ${userId} not found` 
      });
    }

    // Generate a JWT token for the specified user
    const token = generateUserJwtToken(userId, email, firstName, lastName);

    logger().info(`CMS generated token for user: ${email} (${userId})`);

    res.json({
      token,
      userId,
      email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  } catch (error) {
    logger().error(`Error generating token for CMS: ${error}`);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}

/**
 * API endpoint for CMS integration to generate JWT tokens for users
 * This allows your CMS to authenticate users in Plasmic (kept for backward compatibility)
 */
export async function cmsGenerateToken(req: Request, res: Response) {
  // Verify the caller is authenticated (either via session or JWT)
  await jwtAuthMiddleware(req, res, () => {}); // Run JWT middleware to authenticate the CMS
  
  if (!req.user) {
    throw new ForbiddenError("CMS must be authenticated to generate user tokens");
  }

  const { userId, email, firstName, lastName } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ 
      error: "userId and email are required" 
    });
  }

  try {
    // Verify that the user exists in the database
    const mgr = superDbMgr(req);
    const user = await mgr.getUserById(userId);

    if (!user) {
      return res.status(404).json({ 
        error: `User with ID ${userId} not found` 
      });
    }

    // Generate a JWT token for the specified user
    const token = generateUserJwtToken(userId, email, firstName, lastName);

    logger().info(`CMS generated token for user: ${email} (${userId})`);

    res.json({
      token,
      userId,
      email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  } catch (error) {
    logger().error(`Error generating token for CMS: ${error}`);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}

/**
 * API endpoint to verify if a user exists and is valid
 */
export async function cmsVerifyUser(req: Request, res: Response) {
  // Authenticate the CMS caller
  await jwtAuthMiddleware(req, res, () => {});
  
  if (!req.user) {
    throw new ForbiddenError("CMS must be authenticated to verify users");
  }

  const { userId, email } = req.body;

  if (!userId && !email) {
    return res.status(400).json({ 
      error: "Either userId or email is required" 
    });
  }

  try {
    const mgr = superDbMgr(req);
    let user: User | undefined;

    if (userId) {
      user = await mgr.getUserById(userId);
    } else if (email) {
      user = await mgr.getUserByEmail(email);
    }

    if (!user) {
      return res.status(404).json({ 
        exists: false,
        error: userId ? `User with ID ${userId} not found` : `User with email ${email} not found`
      });
    }

    res.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    logger().error(`Error verifying user for CMS: ${error}`);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}

/**
 * API endpoint to get current user information
 */
export async function cmsGetCurrentUser(req: Request, res: Response) {
  // Authenticate the user via JWT
  await jwtAuthMiddleware(req, res, () => {});
  
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