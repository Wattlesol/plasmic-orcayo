import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "@/wab/server/observability";
import { superDbMgr, userDbMgr } from "@/wab/server/routes/util";
import { User } from "@/wab/server/entities/Entities";
import { getEncryptionKey } from "@/wab/server/secrets";
import { UnauthorizedError } from "@/wab/shared/ApiErrors/errors";

// JWT payload interface
export interface JwtPayload {
  userId: string;
  email: string;
  [key: string]: any; // Allow additional properties
}

/**
 * JWT authentication middleware that checks for JWT tokens in query parameters
 */
export async function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Check for JWT token in query parameter
    let token = req.query.token as string | undefined;
    
    // Also check for 'jwt' query parameter as an alternative
    if (!token) {
      token = req.query.jwt as string | undefined;
    }

    // Check for 'authToken' as another alternative
    if (!token) {
      token = req.query.authToken as string | undefined;
    }

    // If no token in query params, check Authorization header as fallback
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      // No JWT token provided, continue with normal flow
      return next();
    }

    // Verify the JWT token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, getEncryptionKey()) as JwtPayload;
    } catch (err) {
      logger().warn(`Invalid JWT token: ${err.message}`);
      // If JWT is invalid, continue with normal flow so they can use regular auth
      return next();
    }

    // Validate that the decoded token has required fields (userId is the primary requirement)
    if (!decoded.userId) {
      logger().warn(`JWT token missing required field: userId`);
      return next();
    }

    // Fetch the user from the database using the decoded user ID
    const mgr = superDbMgr(req);
    let user: User | undefined;
    
    try {
      user = await mgr.getUserById(decoded.userId);
    } catch (err) {
      logger().warn(`User not found for JWT token: ${decoded.userId}`);
      return next();
    }

    // If email is provided in token, validate it matches the database user
    if (decoded.email && user && user.email !== decoded.email) {
      logger().warn(`Email mismatch in JWT token for user ${decoded.userId}`);
      return next();
    }

    if (!user) {
      logger().warn(`User not found in database for JWT token: ${decoded.userId}`);
      return next();
    }

    // Set the user in the request object to indicate authentication
    req.user = user;
    
    // Initialize session for this authenticated user
    if (req.session && user) {
      req.session.passport = { user: user.id };
    }

    // Add JWT token information to the request for potential use in other middleware
    (req as any).jwtPayload = decoded;

    logger().info(`JWT authenticated user: ${user.email || decoded.email} (${user.id})`);
    
    next();
  } catch (err) {
    logger().error(`Error in JWT authentication middleware: ${err}`);
    // Continue with normal flow on error to allow regular authentication
    next();
  }
}

/**
 * Function to check if a valid JWT token is present in the request
 */
export function hasValidJwtToken(req: Request): boolean {
  const token = req.query.token as string | undefined || 
                req.query.jwt as string | undefined ||
                req.query.authToken as string | undefined;
  
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, getEncryptionKey()) as JwtPayload;
    return !!(decoded.userId); // Only require userId for validation
  } catch (err) {
    return false;
  }
}

/**
 * Middleware to skip CSRF check when JWT token is present
 */
export function skipCsrfForJwt(req: Request, res: Response, next: NextFunction) {
  // If we have a valid JWT token, skip CSRF protection
  if (hasValidJwtToken(req)) {
    // Set a flag to indicate CSRF should be skipped
    (req as any).skipCsrf = true;
    logger().info(`Skipping CSRF check due to valid JWT token`);
  }
  next();
}

/**
 * Middleware to skip CSRF check when CMS integration API key is present
 */
export function skipCsrfForCmsApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.CMS_INTEGRATION_API_KEY;
  
  if (apiKey && apiKey === validApiKey) {
    // Set a flag to indicate CSRF should be skipped
    (req as any).skipCsrf = true;
    logger().info(`Skipping CSRF check due to valid CMS integration API key`);
  }
  next();
}

/**
 * Function to generate a JWT token for a user (useful for CMS integration)
 */
export function generateUserJwtToken(userId: string, email: string, firstName?: string, lastName?: string): string {
  const payload: JwtPayload = {
    userId,
    email,
  };
  
  // Add optional user properties
  if (firstName) payload.firstName = firstName;
  if (lastName) payload.lastName = lastName;
  
  // Add standard JWT fields
  payload.iat = Math.floor(Date.now() / 1000); // Issued at time
  payload.exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // Expires in 7 days
  
  return jwt.sign(payload, getEncryptionKey(), {
    algorithm: 'HS256',
  });
}