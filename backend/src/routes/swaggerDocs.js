/**
 * @swagger
 * tags:
 *   - name: Authentication
 *   - name: Workspaces
 *   - name: Projects
 *   - name: Members
 *   - name: Tasks
 *   - name: Comments
 *
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, example: Nana }
 *               lastName: { type: string, example: Kennedy }
 *               email: { type: string, format: email, example: Nana@example.com }
 *               password: { type: string, format: password, example: password123 }
 *     responses:
 *       201: { description: User created }
 *       400: { description: Invalid or duplicate user data }
 *
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Log in and set access and refresh cookies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: Nana@example.com }
 *               password: { type: string, format: password, example: password123 }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Incorrect password }
 *       404: { description: User not found }
 *
 * /api/v1/auth/refreshtoken:
 *   post:
 *     tags: [Authentication]
 *     summary: Replace an expired access token using the refresh-token cookie
 *     responses:
 *       200: { description: Access token refreshed }
 *       401: { description: Missing refresh token }
 *       403: { description: Invalid refresh token }
 *
 * /api/v1/auth/session:
 *   get:
 *     tags: [Authentication]
 *     summary: Check if access-token session is still valid
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Authenticated }
 *       401: { description: Missing or expired access token }
 *
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Clear authentication cookies and revoke the refresh token
 *     responses:
 *       200: { description: Logout successful }
 *       404: {description: Token not found}
 *
 * /api/v1/workspace/createworkspace:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create a workspace
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspace_name]
 *             properties:
 *               workspace_name: { type: string, example: Product Team }
 *     responses:
 *       200: { description: Workspace created }
 *
 * /api/v1/workspace/getworkspaces:
 *   get:
 *     tags: [Workspaces]
 *     summary: List workspaces created by the current user
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Workspace list }
 *
 * /api/v1/workspace/getparticularworkspace/{workspace_id}:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get a workspace
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       200: { description: Workspace found }
 *       404: { description: Workspace not found }
 *
 * /api/v1/workspace/deleteworkspace/{workspace_id}:
 *   delete:
 *     tags: [Workspaces]
 *     summary: Delete a workspace
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       203: { description: Workspace deleted }
 *       401: { description: Not permitted }
 *
 * /api/v1/project/createproject/{workspace_id}:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project in a workspace
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project_name]
 *             properties:
 *               project_name: { type: string, example: Mobile app }
 *     responses:
 *       200: { description: Project created }
 *
 * /api/v1/project/getprojects/{workspace_id}:
 *   get:
 *     tags: [Projects]
 *     summary: List projects in a workspace
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       200: { description: Project list }
 *
 * /api/v1/project/getparticularproject/{project_id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *     responses:
 *       200: { description: Project found }
 *       404: { description: Project not found }
 *
 * /api/v1/project/deleteproject/{project_id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *     responses:
 *       203: { description: Project deleted }
 *       401: { description: Not permitted }
 *
 * /api/v1/members/createinvitecodes/{project_id}:
 *   post:
 *     tags: [Members]
 *     summary: Create a two-hour project invitation code for a particular role, either Project Manager, Team Manager, Team Member
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [Team Member, Project Manager, Team Manager ] }
 *     responses:
 *       200: { description: Invitation code created }
 *       401: { description: Not permitted }
 *       503: { description: Redis is unavailable }
 *
 * /api/v1/members/invitemember:
 *   post:
 *     tags: [Members]
 *     summary: Join a project with an invitation code
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invite_code]
 *             properties:
 *               invite_code: { type: string, example: abc123xyz0 }
 *     responses:
 *       200: { description: Member added }
 *       401: { description: Invalid invitation code }
 *       503: { description: Redis is unavailable }
 *
 * /api/v1/members/editmember/{project_id}:
 *   patch:
 *     tags: [Members]
 *     summary: Change a project member role
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, role]
 *             properties:
 *               role: { type: string, enum: [Project Manager, Team Manager, Team Member] }
 *     responses:
 *       200: { description: Member updated }
 *       401: { description: Not permitted }
 *
 * /api/v1/members/deletemember/{project_id}:
 *   delete:
 *     tags: [Members]
 *     summary: Remove a project member
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [member_id]
 *             properties:
 *               member_id: { type: integer, example: abc-123 }
 *     responses:
 *       200: { description: Member removed }
 *
 * /api/v1/members/getmembers/{project_id}:
 *   get:
 *     tags: [Members]
 *     summary: List members in a project
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *     responses:
 *       200: { description: Member list }
 *
 * /api/v1/tasks/createtask/{project_id}:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskInput' }
 *     responses:
 *       200: { description: Task created }
 *
 * /api/v1/tasks/edittask/{task_id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/TaskId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskInput' }
 *     responses:
 *       200: { description: Task updated }
 *       401: { description: Not permitted }
 *
 * /api/v1/tasks/deletetask/{task_id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/TaskId'
 *     responses:
 *       203: { description: Task deleted }
 *
 * /api/v1/tasks/changestatus/{task_id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Change a task status
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/TaskId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [In progress, Done, Approved] }
 *     responses:
 *       200: { description: Task status updated }
 *
 * /api/v1/tasks/gettasks/{project_id}/{status}:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks in a project by status
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *       - name: status
 *         in: path
 *         required: true
 *         schema: { type: string, enum: [to do, In progress, Done, Approved] }
 *     responses:
 *       200: { description: Task list }
 *
 * /api/v1/comments/newcomment/{project_id}:
 *   post:
 *     tags: [Comments]
 *     summary: Add a comment to a project
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment: { type: string, example: Please review the latest changes. }
 *               mentionId: { type: integer, example: 7 }
 *     responses:
 *       200: { description: Comment created }
 *
 * /api/v1/comments/getcomments/{project_id}:
 *   get:
 *     tags: [Comments]
 *     summary: List comments for a project
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdPath'
 *     responses:
 *       200: { description: Comment list }
 *
 * components:
 *   parameters:
 *     WorkspaceId:
 *       name: workspace_id
 *       in: path
 *       required: true
 *       schema: { type: string, default: abc-123 }
 *     ProjectId:
 *       name: project_id
 *       in: path
 *       required: true
 *       schema: { type: string, example: abc-123 }
 *     ProjectIdPath:
 *       name: project_id
 *       in: path
 *       required: true
 *       schema: { type: string, example: abc-123 }
 *     TaskId:
 *       name: task_id
 *       in: path
 *       required: true
 *       schema: { type: string, example: abc-123 }
 *   schemas:
 *     TaskInput:
 *       type: object
 *       required: [task_name, due_date, assigned_to]
 *       properties:
 *         task_name: { type: string, example: Prepare release notes }
 *         due_date: { type: string, format: date, example: '08/30/2026' }
 *         assigned_to: { type: string, example: Gift }
 */
