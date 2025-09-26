import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, async (accessToken, refreshToken, profile, done) => {
  // Upsert user in DB
  const user = await storage.upsertUser({
    id: profile.id,
    email: profile.emails?.[0]?.value || "",
    firstName: profile.name?.givenName || "",
    lastName: profile.name?.familyName || "",
    profileImageUrl: profile.photos?.[0]?.value || "",
  });
  done(null, user);
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await storage.getUser(id);
  done(null, user);
});

export function setupGoogleAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/login", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get("/api/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/login",
    successReturnToOrRedirect: "/",
  }));

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Not authenticated" });
};
