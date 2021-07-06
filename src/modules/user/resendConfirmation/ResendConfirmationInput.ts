import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class ResendConfirmationInput {
	@Field()
	@IsEmail()
	email: string;
}
