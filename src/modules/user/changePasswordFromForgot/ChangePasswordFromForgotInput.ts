import { Field, InputType } from "type-graphql";

import { PasswordMixin } from "#root/modules/shared/PasswordInput";

@InputType()
export class ChangePasswordFromForgotInput extends PasswordMixin(class {}) {
	@Field()
	token: string;
}
