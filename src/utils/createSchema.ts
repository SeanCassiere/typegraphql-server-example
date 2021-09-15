import path from "path";
import { buildSchema } from "type-graphql";

export const createSchema = async () => {
	return await buildSchema({
		resolvers: [path.join(__dirname + "/../modules/*/*.*")],
	});
};
