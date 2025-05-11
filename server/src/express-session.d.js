// types/express-session.d.ts
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      _id: string;
      username: string;
      isAdmin: boolean;
    };
  }
}

declare module "express" {
  interface Request {
    session: session.Session & Partial<session.SessionData>;
  }
}
