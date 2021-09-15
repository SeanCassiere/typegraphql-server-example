import { MiddlewareFn } from "type-graphql";

import { MyContext } from "#root/types/MyContext";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
	if (!context.req.session.userId) {
		throw new Error("You are not authorized");
	}

	return next();
};
