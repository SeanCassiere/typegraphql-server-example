import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import dotenv from "dotenv";
import session from "express-session";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import connectRedis from "connect-redis";

import { RegisterResolver } from "./modules/user/Register";
import { redis } from "./redis";
import cors from "cors";
import { LoginResolver } from "./modules/user/Login";
import { MyContext } from "./types/MyContext";
import { MeResolver } from "./modules/user/Me";

dotenv.config();

const main = async () => {
	await createConnection();

	const schema = await buildSchema({
		resolvers: [RegisterResolver, LoginResolver, MeResolver],
	});

	const apolloServer = new ApolloServer({
		schema,
		context: (ctx: MyContext) => ctx,
	});

	const app = Express();

	const RedisStore = connectRedis(session);

	app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

	app.use(
		session({
			store: new RedisStore({
				client: redis as any,
			}),
			name: "qid",
			secret: process.env.SESSION_SECRET || "dev_secret",
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
			},
		})
	);

	apolloServer.applyMiddleware({ app });

	app.listen(4000, () => console.log(`Server started on port 4000`));
};

main();
