import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import brcypt from "bcryptjs";

import { User } from "#root/entity/User";
import { redis } from "#root/redis";
import { forgotPasswordPrefix } from "#root/modules/constants/redisPrefixes";
import { ChangePasswordFromForgotInput } from "./changePasswordFromForgot/ChangePasswordFromForgotInput";
import { MyContext } from "#root/types/MyContext";

@Resolver()
export class ChangePasswordFromForgotResolver {
	@Mutation(() => User, { nullable: true })
	async changePasswordFromForgot(
		@Arg("data") { token, password }: ChangePasswordFromForgotInput,
		@Ctx() ctx: MyContext
	): Promise<User | null> {
		const userId = await redis.get(forgotPasswordPrefix + token);

		if (!userId) return null;

		const user = await User.findOne(userId);

		if (!user) return null;
		await redis.del(forgotPasswordPrefix + token);

		const hashedPassword = await brcypt.hash(password, 12);
		user.password = hashedPassword;
		await user.save();

		ctx.req.session.userId = user.id;

		return user;
	}
}
