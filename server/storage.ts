import { 
  users, 
  projects, 
  components, 
  designTokens, 
  files, 
  forms, 
  apiEndpoints, 
  activityLogs, 
  notifications,
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type Component,
  type InsertComponent,
  type DesignToken,
  type InsertDesignToken,
  type File,
  type InsertFile,
  type Form,
  type InsertForm,
  type ApiEndpoint,
  type InsertApiEndpoint,
  type ActivityLog,
  type InsertActivityLog,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: any;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  
  // Component operations
  getComponents(projectId: string): Promise<Component[]>;
  createComponent(component: InsertComponent): Promise<Component>;
  
  // Design token operations
  getDesignTokens(projectId: string): Promise<DesignToken[]>;
  createDesignToken(token: InsertDesignToken): Promise<DesignToken>;
  
  // File operations
  getFiles(userId: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: string): Promise<void>;
  
  // Form operations
  getForms(userId: string): Promise<Form[]>;
  getForm(id: string): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: string): Promise<void>;
  
  // API endpoint operations
  getApiEndpoints(userId: string): Promise<ApiEndpoint[]>;
  createApiEndpoint(endpoint: InsertApiEndpoint): Promise<ApiEndpoint>;
  
  // Activity log operations
  getActivityLogs(userId: string): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Project operations
  async getProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: string, updateProject: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updateProject, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Component operations
  async getComponents(projectId: string): Promise<Component[]> {
    return await db.select().from(components).where(eq(components.projectId, projectId));
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const [component] = await db
      .insert(components)
      .values(insertComponent)
      .returning();
    return component;
  }

  // Design token operations
  async getDesignTokens(projectId: string): Promise<DesignToken[]> {
    return await db.select().from(designTokens).where(eq(designTokens.projectId, projectId));
  }

  async createDesignToken(insertToken: InsertDesignToken): Promise<DesignToken> {
    const [token] = await db
      .insert(designTokens)
      .values(insertToken)
      .returning();
    return token;
  }

  // File operations
  async getFiles(userId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.userId, userId)).orderBy(desc(files.createdAt));
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  // Form operations
  async getForms(userId: string): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.userId, userId)).orderBy(desc(forms.updatedAt));
  }

  async getForm(id: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db
      .insert(forms)
      .values(insertForm)
      .returning();
    return form;
  }

  async updateForm(id: string, updateForm: Partial<InsertForm>): Promise<Form | undefined> {
    const [form] = await db
      .update(forms)
      .set({ ...updateForm, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return form;
  }

  async deleteForm(id: string): Promise<void> {
    await db.delete(forms).where(eq(forms.id, id));
  }

  // API endpoint operations
  async getApiEndpoints(userId: string): Promise<ApiEndpoint[]> {
    return await db.select().from(apiEndpoints).where(eq(apiEndpoints.userId, userId));
  }

  async createApiEndpoint(insertEndpoint: InsertApiEndpoint): Promise<ApiEndpoint> {
    const [endpoint] = await db
      .insert(apiEndpoints)
      .values(insertEndpoint)
      .returning();
    return endpoint;
  }

  // Activity log operations
  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).where(eq(activityLogs.userId, userId)).orderBy(desc(activityLogs.createdAt)).limit(10);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
