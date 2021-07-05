import { Resolver, Mutation, Arg } from "type-graphql";

import { User } from "../../entity/User";
import { redis } from "../../redis";
import { confirmationEmailPrefix } from "../constants/redisPrefixes";

@Resolver()
export class ConfirmUserResolver {
	@Mutation(() => Boolean)
	async confirmUser(@Arg("token") token: string): Promise<boolean> {
		const userId = await redis.get(confirmationEmailPrefix + token);

		if (!userId) return false;

		await User.update({ id: parseInt(userId, 10) }, { isEmailConfirmed: true });
		await redis.del(confirmationEmailPrefix + token);

		return true;
	}
}
