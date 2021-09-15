import { Resolver, Mutation, Arg } from "type-graphql";

import { User } from "#root/entity/User";
import { redis } from "#root/redis";
import { confirmationEmailPrefix } from "#root/modules/constants/redisPrefixes";

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
