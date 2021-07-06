import { Connection } from "typeorm";
import faker from "faker";
import bcrypt from "bcryptjs";
import { v4 } from "uuid";

import { testConn } from "../../../test-utils/testConn";
import { gCall } from "../../../test-utils/gCall";
import { redis } from "../../../redis";
import { User } from "../../../entity/User";
import { forgotPasswordPrefix } from "../../constants/redisPrefixes";

let conn: Connection;
beforeAll(async () => {
	conn = await testConn();
});
afterAll(async () => {
	redis.quit();
	await conn.close();
});

const meQuery = `
	mutation ($data: ChangePasswordFromForgotInput!) {
		changePasswordFromForgot(data: $data) {
			id
			firstName
			lastName
			email
		}
	}
`;

describe("ChangePasswordFromForgot", () => {
	it("change password if valid token", async () => {
		const token = v4();
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: await bcrypt.hash(faker.internet.password(), 12),
			isEmailConfirmed: true,
		}).save();

		await redis.set(forgotPasswordPrefix + token, user.id, "ex", 60 * 60 * 24); //Expire in 1 day

		const response = await gCall({
			source: meQuery,
			variableValues: {
				data: {
					token: token,
					password: faker.internet.password(),
				},
			},
		});

		console.log("change password if valid token", response);

		expect(response).toMatchObject({
			data: {
				changePasswordFromForgot: {
					id: `${user.id}`,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
				},
			},
		});
	});

	it("fail change password if token is invalid", async () => {
		const token = v4();

		const response = await gCall({
			source: meQuery,
			variableValues: {
				data: {
					token: token,
					password: faker.internet.password(),
				},
			},
		});

		console.log("fail forgot password change", response);

		expect(response).toMatchObject({
			data: {
				changePasswordFromForgot: null,
			},
		});
	});
});
