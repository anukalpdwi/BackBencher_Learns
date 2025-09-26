import {
  users,
  topics,
  quizzes,
  quizAttempts,
  flashcards,
  studyGroups,
  studyGroupMembers,
  posts,
  postLikes,
  postComments,
  achievements,
  learningSessions,
  type User,
  type UpsertUser,
  type Topic,
  type InsertTopic,
  type Quiz,
  type InsertQuiz,
  type QuizAttempt,
  type Flashcard,
  type StudyGroup,
  type InsertStudyGroup,
  type Post,
  type InsertPost,
  type Achievement,
  type LearningSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Topic operations
  createTopic(topic: InsertTopic): Promise<Topic>;
  getUserTopics(userId: string): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;
  updateTopicProgress(id: string, progress: number): Promise<void>;
  
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getTopicQuizzes(topicId: string): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  submitQuizAttempt(attempt: {
    quizId: string;
    userId: string;
    score: number;
    totalQuestions: number;
    answers: any;
  }): Promise<QuizAttempt>;
  getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>;
  
  // Flashcard operations
  createFlashcard(flashcard: {
    topicId: string;
    userId: string;
    front: string;
    back: string;
  }): Promise<Flashcard>;
  getTopicFlashcards(topicId: string): Promise<Flashcard[]>;
  
  // Social operations
  createPost(post: InsertPost): Promise<Post>;
  createRepost(originalPostId: string, userId: string): Promise<Post>;
  getFeedPosts(userId: string, limit?: number): Promise<(Post & { user: User; likeCount: number; commentCount: number; isLiked?: boolean })[]>;
  togglePostLike(postId: string, userId: string): Promise<void>;
  addPostComment(comment: {
    postId: string;
    userId: string;
    content: string;
  }): Promise<void>;
  
  // Study group operations
  createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup>;
  getStudyGroups(): Promise<(StudyGroup & { creator: User; memberCount: number })[]>;
  joinStudyGroup(groupId: string, userId: string): Promise<void>;
  
  // User progress operations
  updateUserXP(userId: string, xpGained: number): Promise<User>;
  updateUserStreak(userId: string): Promise<User>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
  // Learning session tracking
  createLearningSession(session: {
    userId: string;
    topicId?: string;
    activityType: string;
    duration?: number;
    xpGained?: number;
  }): Promise<LearningSession>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Topic operations
  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [newTopic] = await db.insert(topics).values(topic).returning();
    return newTopic;
  }

  async getUserTopics(userId: string): Promise<Topic[]> {
    return await db
      .select()
      .from(topics)
      .where(eq(topics.userId, userId))
      .orderBy(desc(topics.updatedAt));
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic;
  }

  async updateTopicProgress(id: string, progress: number): Promise<void> {
    await db
      .update(topics)
      .set({ progress, updatedAt: new Date() })
      .where(eq(topics.id, id));
  }

  // Quiz operations
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async getTopicQuizzes(topicId: string): Promise<Quiz[]> {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.topicId, topicId))
      .orderBy(desc(quizzes.createdAt));
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async submitQuizAttempt(attempt: {
    quizId: string;
    userId: string;
    score: number;
    totalQuestions: number;
    answers: any;
  }): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  // Flashcard operations
  async createFlashcard(flashcard: {
    topicId: string;
    userId: string;
    front: string;
    back: string;
  }): Promise<Flashcard> {
    const [newFlashcard] = await db.insert(flashcards).values(flashcard).returning();
    return newFlashcard;
  }

  async getTopicFlashcards(topicId: string): Promise<Flashcard[]> {
    return await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.topicId, topicId))
      .orderBy(flashcards.nextReview);
  }

  // Social operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async createRepost(originalPostId: string, userId: string): Promise<Post> {
    const [originalPost] = await db.select().from(posts).where(eq(posts.id, originalPostId));
    if (!originalPost) {
      throw new Error("Original post not found");
    }

    const [repost] = await db.insert(posts).values({
      userId,
      content: originalPost.content,
      type: "repost",
      isRepost: true,
      originalPostId: originalPost.id,
    }).returning();

    await db.update(posts).set({
      repostCount: sql`${posts.repostCount} + 1`,
    }).where(eq(posts.id, originalPostId));

    return repost;
  }

  async getFeedPosts(userId: string, limit: number = 20): Promise<(Post & { user: User; likeCount: number; commentCount: number; isLiked?: boolean })[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        type: posts.type,
        metadata: posts.metadata,
        likeCount: posts.likeCount,
        commentCount: posts.commentCount,
        createdAt: posts.createdAt,
        isLiked: sql<boolean>`EXISTS(SELECT 1 FROM ${postLikes} WHERE ${postLikes.postId} = ${posts.id} AND ${postLikes.userId} = ${userId})`,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          xp: users.xp,
          level: users.level,
          streak: users.streak,
          lastLearningDate: users.lastLearningDate,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return result as (Post & { user: User; likeCount: number; commentCount: number; isLiked: boolean })[];
  }

  async togglePostLike(postId: string, userId: string): Promise<void> {
    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    if (existingLike) {
      await db
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
      await db
        .update(posts)
        .set({ likeCount: sql`${posts.likeCount} - 1` })
        .where(eq(posts.id, postId));
    } else {
      await db.insert(postLikes).values({ postId, userId });
      await db
        .update(posts)
        .set({ likeCount: sql`${posts.likeCount} + 1` })
        .where(eq(posts.id, postId));
    }
  }

  async addPostComment(comment: {
    postId: string;
    userId: string;
    content: string;
  }): Promise<void> {
    await db.insert(postComments).values(comment);
    await db
      .update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, comment.postId));
  }

  // Study group operations
  async createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup> {
    const [newGroup] = await db.insert(studyGroups).values(group).returning();
    
    // Add creator as admin member
    await db.insert(studyGroupMembers).values({
      groupId: newGroup.id,
      userId: group.creatorId,
      role: "admin",
    });
    
    return newGroup;
  }

  async getStudyGroups(): Promise<(StudyGroup & { creator: User; memberCount: number })[]> {
    const result = await db
      .select({
        id: studyGroups.id,
        name: studyGroups.name,
        description: studyGroups.description,
        creatorId: studyGroups.creatorId,
        isActive: studyGroups.isActive,
        memberCount: studyGroups.memberCount,
        nextSession: studyGroups.nextSession,
        createdAt: studyGroups.createdAt,
        creator: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          xp: users.xp,
          level: users.level,
          streak: users.streak,
          lastLearningDate: users.lastLearningDate,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(studyGroups)
      .innerJoin(users, eq(studyGroups.creatorId, users.id))
      .where(eq(studyGroups.isActive, true))
      .orderBy(desc(studyGroups.createdAt));

    return result as (StudyGroup & { creator: User; memberCount: number })[];
  }

  async joinStudyGroup(groupId: string, userId: string): Promise<void> {
    await db.insert(studyGroupMembers).values({ groupId, userId });
    await db
      .update(studyGroups)
      .set({ memberCount: sql`${studyGroups.memberCount} + 1` })
      .where(eq(studyGroups.id, groupId));
  }

  // User progress operations
  async updateUserXP(userId: string, xpGained: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        xp: sql`${users.xp} + ${xpGained}`,
        level: sql`CASE 
          WHEN ${users.xp} + ${xpGained} >= 1000 THEN FLOOR((${users.xp} + ${xpGained}) / 1000) + 1 
          ELSE ${users.level} 
        END`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStreak(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastLearning = user.lastLearningDate ? new Date(user.lastLearningDate) : null;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (lastLearning) {
      lastLearning.setHours(0, 0, 0, 0);
      if (lastLearning.getTime() === yesterday.getTime()) {
        newStreak = (user.streak || 0) + 1;
      } else if (lastLearning.getTime() === today.getTime()) {
        newStreak = user.streak || 0; // Already learned today
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({ 
        streak: newStreak,
        lastLearningDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.earnedAt));
  }

  // Learning session tracking
  async createLearningSession(session: {
    userId: string;
    topicId?: string;
    activityType: string;
    duration?: number;
    xpGained?: number;
  }): Promise<LearningSession> {
    const [newSession] = await db.insert(learningSessions).values({
      ...session,
      completedAt: new Date(),
    }).returning();
    return newSession;
  }
}

export const storage = new DatabaseStorage();