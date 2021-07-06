// import { Length, IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";
import { PasswordMixin } from "../../shared/PasswordInput";

@InputType()
export class ChangePasswordFromForgotInput extends PasswordMixin(class {}) {
	@Field()
	token: string;
}
