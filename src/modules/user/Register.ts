import { Arg, Mutation, Query, Resolver } from "type-graphql";
import brcypt from "bcryptjs";

import { User } from "#root/entity/User";
import { RegisterInput } from "./register/RegisterInput";
import { sendEmail } from "#root/modules/utils/sendEmail";
import { createConfirmationUrl } from "#root/modules/utils/createConfirmationUrl";

@Resolver()
export class RegisterResolver {
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

		await sendEmail(email, await createConfirmationUrl(user.id));

		return user;
	}
}
