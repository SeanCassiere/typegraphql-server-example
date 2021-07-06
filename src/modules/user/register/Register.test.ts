import { Connection } from "typeorm";
import faker from "faker";

import { testConn } from "../../../test-utils/testConn";
import { gCall } from "../../../test-utils/gCall";
import { redis } from "../../../redis";
import { User } from "../../../entity/User";

let conn: Connection;
beforeAll(async () => {
	conn = await testConn();
});
afterAll(async () => {
	redis.quit();
	await conn.close();
});

const registerMutation = `
mutation RegisterMutation($data: RegisterInput!) {
  register(
    data: $data
  ) {
    firstName
    lastName
    email
  }
}
`;

describe("Register", () => {
	it("create user", async () => {
		const user = {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: faker.internet.password(),
		};
		// console.log("user for register:", user);
		const response = await gCall({
			source: registerMutation,
			variableValues: {
				data: user,
			},
		});

		console.log("register create user:", response);

		expect(response).toMatchObject({
			data: {
				register: {
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email.toLowerCase(),
				},
			},
		});

		const dbUser = await User.findOne({ where: { email: user.email.toLowerCase() } });
		expect(dbUser).toBeDefined();
		expect(dbUser!.isEmailConfirmed).toBeFalsy();
		expect(dbUser!.firstName).toBe(user.firstName);
	});
});
