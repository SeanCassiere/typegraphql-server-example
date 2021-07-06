import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import brcypt from "bcryptjs";

import { User } from "../../entity/User";
import { ChangePasswordInput } from "./changePassword/ChangePasswordInput";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class ChangePasswordResolver {
	@Mutation(() => User, { nullable: true })
	async changePassword(
		@Arg("data") { oldPassword, password }: ChangePasswordInput,
		@Ctx() ctx: MyContext
	): Promise<User | null> {
		if (!ctx.req.session.userId) return null;

		const user = await User.findOne(ctx.req.session.userId);

		if (!user) return null;

		const comparePassword = await brcypt.compare(oldPassword, user.password);

		if (!comparePassword) return null;

		const hashedPassword = await brcypt.hash(password, 12);
		user.password = hashedPassword;
		await user.save();

		return user;
	}
}
