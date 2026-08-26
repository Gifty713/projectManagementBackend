Project Management API

A robust RESTful backend API for managing workspaces, projects, tasks, team members and real-time project activity.
Built with Node.js, Express.js, PostgreSQL, Redis, Socket.IO, and JWT authentication, 
this API provides the backend infrastructure for a collaborative project management application.

Features
-JWT-based authentication
-Secure authentication using HTTP-only cookies
-User account management
-Workspace management
-Project management
-Task creation and management
-Project membership and role-based actions
-Temporary Redis-managed invite code storage
-Project based comment section using real time communication with Socket.io
-Email notifications for unread mentions after some hours.

Tech Stack includes : Node.js, Express.js, PostgreSQL, Socket.IO, and other libraries like Cookie-parser,  Resend, Redis, JWT.

The API is live and can be interacted with here: https://myprojectman.top/api-docs


Core Features Explained:
The project management app is used to enable members collaborate and in real time update themselves of the outcomes of the project.

Database Structure:
  Users
  
     |
     |____Workspaces
	 
         |
         |
         |____Projects
		 
		      |_____Tasks			  
              |
              |_____Comments			  
              |
              |_____Project Members

	     	
Authentication & Users:
The API provides authentication and user-related functionality.
Typical capabilities include:
-User registration
-User login
-User logout
-Authentication validation
-Refreshing authentication sessions

Workspaces:
Users can create workspaces and then create projects, where they can invite other users to collaborate on projects.

Projects:
Projects act as the main collaborative unit of the application.
Users can perform actions such as:
- Create projects 
- View projects
- Access individual project details
- Update projects
- Delete projects
- Manage project members
- Create project tasks
- Add comments
- Invite other users
Project actions are restricted based on assigned roles.

Tasks:
Projects contain tasks that allow teams to organize and track work.
Task functionality includes:
- Creating tasks
- Updating tasks
- Managing task status
- Associating tasks with projects
- Tracking project progress

Tasks are organized into 4 stages, designed to be like a Kanban board:
- To Do
- In Progress
- Done
- Approved

Project Members & Roles:
Projects support multiple users with different responsibilities. Authorization checks are used to ensure that users can only perform actions allowed by their role.

Members can be assigned roles such as:
- Project Manager
- Team Manager
- Team Member
The creator of the workspace is automatically assigned as the Admin, the overseer of all.

Project Invitations:
Users, particularly Admins can invite other users to a project through temporary invitation codes.
The API generates a unique invite code with the exact role of the invitee and expires after 2 hours.
This avoids permanently storing temporary invitation codes in the PostgreSQL database.

Comments:
The project management Api support a comment system that allows team members to communicate for each project, in real time. As well as receive email notifications, that they are mentioned in and have not seen, after 1 day.
Users can:
-Add comments to projects
-Retrieve project comments
-Receive real-time updates when new comments are created
-Receive email notifications if mentioned and unseen.
Comments are persisted in PostgreSQL.

Thank you for reading through, I hope the documentation was explained properly and you understood the project.
