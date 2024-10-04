// Packages
import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Maybe } from 'graphql/jsutils/Maybe';

// Emails
import { IEmail, IEmailFilters } from './email.interfaces';

@ObjectType()
export class UserEmail implements IEmail {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  address: string;

  userId: string;
}

@InputType()
export class StringFilters {
  @IsOptional()
  @Field(() => String, { nullable: true })
  equal: Maybe<string>;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  in: Maybe<string[]>;
}

/**
 * Type d'entrée GraphQL pour la mutation des addresses mails d'un utilisateur
 */
@InputType()
@ArgsType()
export class MutateUserEmailArgs {
  @IsUUID('all', {
    message: `L'identifiant de l'utilisateur doit être un UUID`,
  })
  @IsNotEmpty({ message: `L'identifiant de l'utilisateur doit être défini` })
  @Field(() => String)
  userId: string;

  @Field(() => String)
  @IsEmail()
  email: string;
}

@ArgsType()
export class EmailFiltersArgs implements IEmailFilters {
  @IsOptional()
  @Field(() => StringFilters, { nullable: true })
  address?: Maybe<StringFilters>;
}
