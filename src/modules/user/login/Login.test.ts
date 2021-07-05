import { Connection } from "typeorm";
import faker from "faker";
import bcrypt from "bcryptjs";

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

const meQuery = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      firstName
      lastName
      email
    }
  }
`;

describe("Login", () => {
	it("get confirmed user", async () => {
		const userPass = faker.internet.password();
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: await bcrypt.hash(userPass, 12),
			isEmailConfirmed: true,
		}).save();

		const response = await gCall({
			source: meQuery,
			variableValues: {
				email: user.email,
				password: userPass,
			},
		});

		console.log(response);

		expect(response).toMatchObject({
			data: {
				login: {
					id: `${user.id}`,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
				},
			},
		});
	});

	it("return null, email not confirmed", async () => {
		const userPass = faker.internet.password();
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: await bcrypt.hash(userPass, 12),
		}).save();

		const response = await gCall({
			source: meQuery,
			variableValues: {
				email: user.email,
				password: userPass,
			},
		});

		console.log(response);

		expect(response).toMatchObject({
			data: {
				login: null,
			},
		});
	});
});
