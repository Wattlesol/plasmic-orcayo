# Project Summary

## Overall Goal
Implement a CMS integration solution for Plasmic that allows embedding the web builder, authenticating users via JWT tokens based on user ID, listing projects in an HTML app, and opening specific projects in the builder when clicked.

## Key Knowledge
- **Technology Stack**: Plasmic uses a multi-service architecture with frontend (port 3003), backend (port 3004), and host server (port 3005)
- **Database**: PostgreSQL with a database named 'wab' and user 'wab'
- **Node.js Version**: v21.5.0 is required (v25.1.0 causes compatibility issues with buffer libraries)
- **Credentials**: Default admin credentials are email: admin@admin.example.com, password: !53kr3tz!
- **Build Tools**: Uses Yarn for dependency management, rsbuild for frontend bundling
- **Authentication**: JWT-based authentication with API key protection for CMS integration
- **Project Structure**: Monorepo with multiple packages including canvas-packages, host, live-frame, react-web-bundle, sub, wab (main application)
- **URL Format**: `http://localhost:3003/p/{projectId}?token={jwtToken}` is the correct format to open a specific project
- **Seeding**: The database seed script `yarn seed` populates the database with test users, projects, and feature tiers
- **API Endpoints**: `/api/v1/cms-integration/generate-token` for JWT token generation, `/api/v1/user/projects` for user project listing

## Recent Actions
- Resolved Node.js version compatibility issues by switching to v21.5.0
- Successfully started backend service on port 3004 with working CSRF endpoint
- Started frontend service on port 3003 and host server on port 3005
- Created admin user with credentials from ADMIN-CREDENTIALS.md
- Ran database seed script to populate database with test data
- Implemented CMS integration API endpoints for generating JWT tokens and user projects
- Created HTML demo file `cms-integration-demo.html` with project listing and builder embedding
- Implemented CSRF bypass for CMS integration endpoints
- Updated redirection to projects view after JWT authentication
- Fixed project opening functionality to properly load specific projects in the builder
- Removed problematic UI elements that interfered with builder loading
- Ensured proper fallback functionality for demo projects

## Current Plan
1. [DONE] Set up PostgreSQL database with correct user and database
2. [DONE] Run database migrations
3. [DONE] Install all dependencies using Yarn
4. [DONE] Build dependencies using setup script
5. [DONE] Generate parser files
6. [DONE] Start all development services (frontend, backend, host)
7. [DONE] Verify services are responsive and properly connected
8. [DONE] Create users with credentials from ADMIN-CREDENTIALS.md
9. [DONE] Populate database with test data using seed script
10. [DONE] Verify CSRF endpoint functionality for authentication
11. [DONE] Confirm all services are working together properly
12. [DONE] Implement CMS integration API for JWT token generation
13. [DONE] Create user projects API to list projects for authenticated users
14. [DONE] Create HTML integration demo to list and open projects
15. [DONE] Test project opening functionality in embedded builder
16. [DONE] Fix project URL format to properly open specific projects
17. [DONE] Remove problematic UI elements that interfere with builder loading
18. [DONE] Ensure proper fallback functionality for demo projects
19. [DONE] Close development server and clean up memory
20. [DONE] Complete the project and provide comprehensive documentation

---

## Summary Metadata
**Update time**: 2025-11-04T16:48:06.700Z 
