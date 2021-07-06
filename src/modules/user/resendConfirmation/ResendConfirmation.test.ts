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

const meQuery = `
	mutation ResendConfirmation($data: ResendConfirmationInput!) {
		resendConfirmation(data: $data)
	}
`;

describe("ResendConfirmation", () => {
	it("resend for unconfirmed user", async () => {
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: faker.internet.password(),
		}).save();

		const response = await gCall({
			source: meQuery,
			variableValues: {
				data: {
					email: user.email,
				},
			},
		});

		console.log("resend for unconfirmed user:", response);

		expect(response).toMatchObject({
			data: {
				resendConfirmation: true,
			},
		});
	});

	it("return true to resend for confirmed user", async () => {
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: faker.internet.password(),
			isEmailConfirmed: true,
		}).save();

		const response = await gCall({
			source: meQuery,
			variableValues: {
				data: {
					email: user.email,
				},
			},
		});

		console.log("resend for confirmed user:", response);

		expect(response).toMatchObject({
			data: {
				resendConfirmation: true,
			},
		});
	});

	it("return true for non-existent user", async () => {
		const email = faker.internet.email().toLowerCase();

		const response = await gCall({
			source: meQuery,
			variableValues: {
				data: { email },
			},
		});

		console.log("resend for non-existent user:", response);

		expect(response).toMatchObject({
			data: {
				resendConfirmation: true,
			},
		});
	});
});
