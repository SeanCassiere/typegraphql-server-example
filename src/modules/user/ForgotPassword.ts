import { Resolver, Mutation, Arg } from "type-graphql";
import { v4 } from "uuid";

import { User } from "#root/entity/User";
import { redis } from "#root/redis";
import { sendEmail } from "#root/modules/utils/sendEmail";
import { forgotPasswordPrefix } from "#root/modules/constants/redisPrefixes";

@Resolver()
export class ForgotPasswordResolver {
	@Mutation(() => Boolean)
	async forgotPassword(@Arg("email") email: string): Promise<boolean> {
		const user = await User.findOne({ where: { email: email.toLowerCase() } });

		if (!user) return true;

		const token = v4();
		await redis.set(forgotPasswordPrefix + token, user.id, "ex", 60 * 60 * 24); //Expire in 1 day

		await sendEmail(email, `http://localhost:3000/user/change-password/${token}`);

		return true;
	}
}
