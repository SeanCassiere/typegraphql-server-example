import { Connection } from "typeorm";
import faker from "faker";
import { v4 } from "uuid";

import { testConn } from "../../../test-utils/testConn";
import { gCall } from "../../../test-utils/gCall";
import { redis } from "../../../redis";
import { User } from "../../../entity/User";
import { confirmationEmailPrefix } from "../../constants/redisPrefixes";

let conn: Connection;
beforeAll(async () => {
	conn = await testConn();
});
afterAll(async () => {
	redis.quit();
	await conn.close();
});

const confirmUserQuery = `
  mutation ConfirmUser($token: String!) {
    confirmUser(token: $token)
  }
`;

describe("Confirm User", () => {
	it("confirm a unconfirmed user", async () => {
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: faker.internet.password(),
		}).save();

		const token = v4();
		await redis.set(confirmationEmailPrefix + token, user.id, "ex", 60 * 60 * 24); //Expire in 1 day

		const response = await gCall({
			source: confirmUserQuery,
			variableValues: { token },
		});

		console.log("confirm a unconfirmed user:", response);

		expect(response).toMatchObject({
			data: {
				confirmUser: true,
			},
		});
	});

	it("return null, if user already confirmed", async () => {
		const token = v4();
		const response = await gCall({
			source: confirmUserQuery,
			variableValues: { token },
		});

		console.log("confirm a confirmed user:", response);

		expect(response).toMatchObject({
			data: {
				confirmUser: false,
			},
		});
	});
});
