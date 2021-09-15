import { Field, InputType } from "type-graphql";

import { PasswordMixin } from "#root/modules/shared/PasswordInput";

@InputType()
export class ChangePasswordInput extends PasswordMixin(class {}) {
	@Field()
	oldPassword: string;
}
