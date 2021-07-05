import { Length, IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

import { PasswordInput } from "../../shared/PasswordInput";
import { IsEmailAlreadyExists } from "./IsEmailAlreadyExists";

@InputType()
export class RegisterInput extends PasswordInput {
	@Field()
	@Length(1, 255)
	firstName: string;

	@Field()
	@Length(1, 255)
	lastName: string;

	@Field()
	@IsEmail()
	@IsEmailAlreadyExists({ message: "email already in use" })
	email: string;
}
