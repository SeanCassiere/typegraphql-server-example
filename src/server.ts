import http from "http";
import Express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";

import { redis } from "./redis";
import { MyContext } from "./types/MyContext";
import { createSchema } from "./utils/createSchema";
import { createTypeormConn } from "./utils/createTypeormConn";

import { environmentVariables } from "./utils/env";

const PORT = environmentVariables.PORT;

const app = Express();
const httpServer = http.createServer(app);

export const startServer = async () => {
	await createTypeormConn();

	const schema = await createSchema();

	const apolloServer = new ApolloServer({
		introspection: true,
		playground: true,
		schema,
		context: (ctx: MyContext) => ctx,
	});

	const RedisStore = connectRedis(session);

	app.use(
		cors({
			origin: (_, cb) => cb(null, true),
			credentials: true,
		})
	);

	app.use(
		session({
			store: new RedisStore({
				client: redis as any,
			}),
			name: "qid",
			secret: environmentVariables.SESSION_SECRET || "dev_secret",
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				secure: environmentVariables.NODE_ENV === "production",
				maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
			},
		})
	);

	await apolloServer.start();

	apolloServer.applyMiddleware({
		app,
		cors: false,
	});

	httpServer.listen({ port: PORT }, () => {
		console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
	});
};
