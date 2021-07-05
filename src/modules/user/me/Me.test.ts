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
{
  me {
    id
    firstName
    lastName
    email
    name
  }
}
`;

describe("Me", () => {
	it("get user", async () => {
		const user = await User.create({
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: faker.internet.email().toLowerCase(),
			password: faker.internet.password(),
		}).save();

		const response = await gCall({
			source: meQuery,
			userId: user.id,
		});

		console.log("meQuery true", response);

		expect(response).toMatchObject({
			data: {
				me: {
					id: `${user.id}`,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
				},
			},
		});
	});

	it("return null", async () => {
		const response = await gCall({
			source: meQuery,
		});

		console.log("meQuery null", response);

		expect(response).toMatchObject({
			data: {
				me: null,
			},
		});
	});
});
