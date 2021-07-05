import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import brcypt from "bcryptjs";

import { User } from "../../entity/User";
import { RegisterInput } from "./register/RegisterInput";
import { isAuth } from "../middleware/isAuth";

@Resolver()
export class RegisterResolver {
	@UseMiddleware([isAuth])
	@Query(() => String)
	async hello() {
		return "Hello World!";
	}

	@Mutation(() => User)
	async register(@Arg("data") { email, firstName, lastName, password }: RegisterInput): Promise<User> {
		const hashedPassword = await brcypt.hash(password, 12);

		const user = await User.create({
			firstName,
			lastName,
			email: email.toLowerCase(),
			password: hashedPassword,
		}).save();

		return user;
	}
}
