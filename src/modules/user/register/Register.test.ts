import { Connection } from "typeorm";

import { testConn } from "../../../test-utils/testConn";
import { gCall } from "../../../test-utils/gCall";

let conn: Connection;
beforeAll(async () => {
	conn = await testConn();
});
afterAll(async () => {
	await conn.close();
});

const registerMutation = `
mutation RegisterMutation($data: RegisterInput!) {
  register(
    data: $data
  ) {
    id
    firstName
    lastName
    email
    name
  }
}
`;

describe("Register", () => {
	it("create user", async () => {
		console.log(
			await gCall({
				source: registerMutation,
				variableValues: {
					data: {
						firstName: "bob",
						lastName: "bob2",
						email: "bob@bob.com",
						password: "bob123",
					},
				},
			})
		);
	});
});
