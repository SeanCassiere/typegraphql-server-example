import { Resolver, Mutation, Arg } from "type-graphql";

import { User } from "#root/entity/User";
import { sendEmail } from "#root/modules/utils/sendEmail";
import { createConfirmationUrl } from "#root/modules/utils/createConfirmationUrl";
import { ResendConfirmationInput } from "./resendConfirmation/ResendConfirmationInput";

@Resolver()
export class ResendConfirmationResolver {
	@Mutation(() => Boolean)
	async resendConfirmation(@Arg("data") { email }: ResendConfirmationInput): Promise<boolean> {
		const user = await User.findOne({ where: { email } });

		if (!user || user.isEmailConfirmed) return true;

		await sendEmail(email, await createConfirmationUrl(user.id));

		return true;
	}
}
