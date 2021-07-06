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

const changePasswordQuery = `
  mutation ChangePassword($data: ChangePasswordInput!){
    changePassword(data: $data) {
      id
      firstName
      email
    }
  }
`;

describe("Change Password", () => {
	it("if user is logged in", async () => {
		const userPass = faker.internet.password();
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: await bcrypt.hash(userPass, 12),
			isEmailConfirmed: true,
		}).save();

		const response = await gCall({
			source: changePasswordQuery,
			userId: user.id,
			variableValues: {
				data: {
					oldPassword: userPass,
					password: faker.internet.password(),
				},
			},
		});

		console.log("password changed successfully:", response);

		expect(response).toMatchObject({
			data: {
				changePassword: {
					id: `${user.id}`,
					firstName: user.firstName,
					email: user.email,
				},
			},
		});
	});

	it("return null, if user is not logged in and does not exist", async () => {
		const userPass = faker.internet.password();

		const response = await gCall({
			source: changePasswordQuery,
			variableValues: {
				data: {
					oldPassword: userPass,
					password: faker.internet.password(),
				},
			},
		});

		console.log("password change failed since not logged in and does not exist:", response);

		expect(response).toMatchObject({
			data: {
				changePassword: null,
			},
		});
	});
});
