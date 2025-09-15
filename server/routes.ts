import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { 
  insertProjectSchema, 
  insertComponentSchema, 
  insertDesignTokenSchema,
  insertFileSchema,
  insertFormSchema,
  insertApiEndpointSchema,
  insertNotificationSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // WebSocket setup for real-time features
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Dashboard data endpoint
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const [projects, activityLogs, notifications] = await Promise.all([
        storage.getProjects(user.id),
        storage.getActivityLogs(user.id),
        storage.getNotifications(user.id),
      ]);

      const stats = {
        projects: projects.length,
        components: await storage.getComponents(projects[0]?.id || '').then(c => c.length),
        exports: Math.floor(Math.random() * 5000), // Placeholder for now
      };

      res.json({
        stats,
        projects: projects.slice(0, 6), // Recent projects
        activities: activityLogs,
        notifications: notifications.filter(n => !n.isRead).slice(0, 5),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Project endpoints
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects = await storage.getProjects(req.user!.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const project = await storage.createProject(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "project_created",
        details: `Created project: ${project.name}`,
      });
      
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Failed to create project", error: error.message });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Component endpoints
  app.get("/api/projects/:projectId/components", requireAuth, async (req, res) => {
    try {
      const components = await storage.getComponents(req.params.projectId);
      res.json(components);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch components" });
    }
  });

  app.post("/api/projects/:projectId/components", requireAuth, async (req, res) => {
    try {
      const validatedData = insertComponentSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      
      const component = await storage.createComponent(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "component_created",
        details: `Created component: ${component.name}`,
      });
      
      res.status(201).json(component);
    } catch (error) {
      res.status(400).json({ message: "Failed to create component", error: error.message });
    }
  });

  // Design token endpoints
  app.get("/api/projects/:projectId/design-tokens", requireAuth, async (req, res) => {
    try {
      const tokens = await storage.getDesignTokens(req.params.projectId);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch design tokens" });
    }
  });

  app.post("/api/projects/:projectId/design-tokens", requireAuth, async (req, res) => {
    try {
      const validatedData = insertDesignTokenSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      
      const token = await storage.createDesignToken(validatedData);
      res.status(201).json(token);
    } catch (error) {
      res.status(400).json({ message: "Failed to create design token", error: error.message });
    }
  });

  // File upload endpoints
  app.get("/api/files", requireAuth, async (req, res) => {
    try {
      const files = await storage.getFiles(req.user!.id);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/files", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileData = insertFileSchema.parse({
        userId: req.user!.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });
      
      const file = await storage.createFile(fileData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "file_uploaded",
        details: `Uploaded file: ${file.originalName}`,
      });
      
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload file", error: error.message });
    }
  });

  // Form builder endpoints
  app.get("/api/forms", requireAuth, async (req, res) => {
    try {
      const forms = await storage.getForms(req.user!.id);
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forms" });
    }
  });

  app.post("/api/forms", requireAuth, async (req, res) => {
    try {
      const validatedData = insertFormSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const form = await storage.createForm(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "form_created",
        details: `Created form: ${form.name}`,
      });
      
      res.status(201).json(form);
    } catch (error) {
      res.status(400).json({ message: "Failed to create form", error: error.message });
    }
  });

  // API endpoint management
  app.get("/api/api-endpoints", requireAuth, async (req, res) => {
    try {
      const endpoints = await storage.getApiEndpoints(req.user!.id);
      res.json(endpoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API endpoints" });
    }
  });

  app.post("/api/api-endpoints", requireAuth, async (req, res) => {
    try {
      const validatedData = insertApiEndpointSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const endpoint = await storage.createApiEndpoint(validatedData);
      res.status(201).json(endpoint);
    } catch (error) {
      res.status(400).json({ message: "Failed to create API endpoint", error: error.message });
    }
  });

  // Notification endpoints
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Figma import endpoint
  app.post("/api/figma/import", requireAuth, async (req, res) => {
    try {
      const { url, projectName, options } = req.body;
      
      // Create new project
      const project = await storage.createProject({
        name: projectName || "Figma Import",
        figmaUrl: url,
        userId: req.user!.id,
        framework: options?.framework || 'react',
        config: options,
      });
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "figma_imported",
        details: `Imported Figma design: ${projectName}`,
      });
      
      // Create notification
      await storage.createNotification({
        userId: req.user!.id,
        title: "Figma Import Complete",
        message: `Successfully imported ${projectName} from Figma`,
        type: "success",
      });
      
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Failed to import from Figma", error: error.message });
    }
  });

  return httpServer;
}
