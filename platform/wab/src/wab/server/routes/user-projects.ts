import { Request, Response } from "express";
import { jwtAuthMiddleware } from "@/wab/server/auth/jwt-auth";
import { superDbMgr } from "@/wab/server/routes/util";
import { Project, Permission, Workspace } from "@/wab/server/entities/Entities";
import { logger } from "@/wab/server/observability";
import { ForbiddenError, NotFoundError } from "@/wab/shared/ApiErrors/errors";
import { In, IsNull } from "typeorm";

/**
 * API endpoint to get projects for the currently authenticated user
 * This allows your HTML app to list projects that the user has access to
 */
export async function getUserProjects(req: Request, res: Response) {
  // Authenticate user via JWT
  await jwtAuthMiddleware(req, res, () => {});
  
  if (!req.user) {
    return res.status(401).json({ 
      error: "User not authenticated" 
    });
  }

  try {
    // Use superDbMgr to access the database directly
    const mgr = superDbMgr(req);
    
    // Directly query for projects where the user has permissions
    const userId = req.user.id;
    
    // Query for projects where user has direct permissions or through workspace/team
    const entMgr = mgr.getEntMgr();
    
    // Get projects the user has permissions for
    const permissions = await entMgr
      .createQueryBuilder(Permission, "perm")
      .where("perm.userId = :userId", { userId })
      .andWhere("perm.deletedAt IS NULL")
      .getMany();
    
    // Extract project IDs from permissions
    const projectIdsFromPerms = permissions
      .filter(perm => perm.projectId)
      .map(perm => perm.projectId);
    
    // Also get projects directly created by the user
    const ownedProjects = await entMgr
      .createQueryBuilder(Project, "project")
      .where("project.createdById = :userId", { userId })
      .getMany();
    
    // Get projects by permission IDs
    let projectsFromPerms: Project[] = [];
    if (projectIdsFromPerms.length > 0) {
      projectsFromPerms = await entMgr
        .createQueryBuilder(Project, "project")
        .where("project.id IN (:...projectIds)", { projectIds: projectIdsFromPerms })
        .getMany();
    }
    
    // Combine and deduplicate projects
    const allProjectIds = new Set([
      ...ownedProjects.map(p => p.id),
      ...projectsFromPerms.map(p => p.id)
    ]);
    
    const allProjects = [
      ...ownedProjects,
      ...projectsFromPerms.filter(p => !ownedProjects.some(op => op.id === p.id))
    ];

    // Format the response data
    const formattedProjects = allProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      publishStatus: project.publishStatus,
      studioUrl: `${req.protocol}://${req.get('host')}/p/${project.id}`, // URL to open in Plasmic Studio
      publishedUrl: project.publishedUrl || null,
      teamName: project.team?.name || 'Personal',
      isFavorite: project.isFavorite || false
    }));

    res.json({
      projects: formattedProjects,
      totalCount: formattedProjects.length,
      userId: req.user.id,
      userEmail: req.user.email
    });

    logger().info(`Retrieved ${formattedProjects.length} projects for user: ${req.user.email}`);
  } catch (error) {
    logger().error(`Error retrieving projects for user ${req.user.id}:`, error);
    res.status(500).json({ 
      error: "Failed to retrieve projects" 
    });
  }
}

/**
 * API endpoint to get a specific project for the authenticated user
 */
export async function getUserProject(req: Request, res: Response) {
  // Authenticate user via JWT
  await jwtAuthMiddleware(req, res, () => {});
  
  if (!req.user) {
    return res.status(401).json({ 
      error: "User not authenticated" 
    });
  }

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ 
      error: "Project ID is required" 
    });
  }

  try {
    // Use superDbMgr to access the database directly
    const mgr = superDbMgr(req);
    
    // Directly query for the specific project
    const entMgr = mgr.getEntMgr();
    
    const project = await entMgr
      .createQueryBuilder(Project, "project")
      .where("project.id = :projectId", { projectId })
      .getOne();
      
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    
    // Check if the user has access to this project
    const userId = req.user.id;
    const isOwner = project.createdById === userId;
    
    if (!isOwner) {
      // Check if user has permissions
      const permission = await entMgr
        .createQueryBuilder(Permission, "perm")
        .where("perm.userId = :userId", { userId })
        .andWhere("perm.projectId = :projectId", { projectId })
        .andWhere("perm.deletedAt IS NULL")
        .getOne();
        
      if (!permission) {
        throw new ForbiddenError("User does not have access to this project");
      }
    }

    res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description || '',
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        publishStatus: project.publishStatus,
        studioUrl: `${req.protocol}://${req.get('host')}/p/${project.id}`, // URL to open in Plasmic Studio
        publishedUrl: project.publishedUrl || null,
        teamName: project.team?.name || 'Personal',
        isFavorite: project.isFavorite || false
      },
      userId: req.user.id,
      userEmail: req.user.email
    });

    logger().info(`Retrieved project ${project.id} for user: ${req.user.email}`);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      logger().error(`Error retrieving project ${projectId} for user ${req.user.id}:`, error);
      res.status(500).json({ 
        error: "Failed to retrieve project" 
      });
    }
  }
}