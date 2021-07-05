import { createConnection } from "typeorm";

export const testConn = async (drop: boolean = false) => {
	return await createConnection({
		name: "default",
		type: "postgres",
		host: "localhost",
		port: 5432,
		username: "postgres",
		password: "",
		database: "typegraphql-server-example-test",
		synchronize: drop,
		logging: false,
		dropSchema: drop,
		entities: [__dirname + "/../entity/*.*"],
	});
};
