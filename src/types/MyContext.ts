import { Request } from "express";
import { Session } from "express-session";

export type SessionWithUser = Session & { userId: number };

export type AuthRequest = Request & {
	session?: SessionWithUser;
};

export interface MyContext {
	req: AuthRequest;
}
