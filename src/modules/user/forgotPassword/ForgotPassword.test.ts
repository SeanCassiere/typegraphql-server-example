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

const forgotPasswordQuery = `
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

describe("ForgotPassword", () => {
	it("trigger forgotPassword for confirmed user", async () => {
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: faker.internet.password(),
			isEmailConfirmed: true,
		}).save();

		const response = await gCall({
			source: forgotPasswordQuery,
			variableValues: {
				email: user.email.toLowerCase(),
			},
		});

		console.log("forgotPassword confirmed user:", response);

		expect(response).toMatchObject({
			data: {
				forgotPassword: true,
			},
		});
	});

	it("trigger forgotPassword for unconfirmed user", async () => {
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: faker.internet.password(),
		}).save();

		const response = await gCall({
			source: forgotPasswordQuery,
			variableValues: {
				email: user.email.toLowerCase(),
			},
		});

		console.log("forgotPassword unconfirmed user:", response);

		expect(response).toMatchObject({
			data: {
				forgotPassword: true,
			},
		});
	});
});
