import { Ctx, Query, Resolver } from "type-graphql";

import { User } from "#root/entity/User";
import { MyContext } from "#root/types/MyContext";

@Resolver()
export class MeResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
		if (!ctx.req.session.userId) {
			return undefined;
		}

		return await User.findOne(ctx.req.session.userId);
	}
}
