// Packages
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Equal, Repository } from 'typeorm';
import { Mutation } from '@nestjs/graphql';
import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

// Emails
import { MutateUserEmailArgs, EmailFiltersArgs, UserEmail } from './email.types';
import { EmailService } from './email.service';
import { IEmail } from './email.interfaces';

// Users
import { User } from '../user/user.types';
import { UserEntity } from '../user/user.entity';

@Resolver(() => UserEmail)
export class EmailResolver {
  constructor(
    private readonly _service: EmailService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Query(() => UserEmail, { name: 'email' })
  getEmail(@Args({ name: 'emailId', type: () => ID }) emailId: string) {
    return this._service.findById(emailId);
  }

  @Query(() => [UserEmail], { name: 'emailsList' })
  async getEmails(@Args() filters: EmailFiltersArgs): Promise<UserEmail[]> {
    return this._service.findByFilters(filters);
  }

  @Mutation(() => UserEmail)
  async addUserEmail(
    @Args() { userId, email }: MutateUserEmailArgs,
  ): Promise<IEmail> {
    // 1. Get User
    const user = await  this.userRepository.findOneBy({ id: Equal(userId) });

    // 2. Handle errors
    //   2.1 - If user is not found
    //   2.1 - If user is deactivated
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    if(user.status === 'inactive') throw new BadRequestException('Cannot update deactivated user emails');

    // 3. Delete user email
    return this._service.create(userId, email);
  }

  @Mutation(() => UserEmail)
  async deleteUserEmail(
    @Args() { userId, email }: MutateUserEmailArgs,
  ): Promise<IEmail> {
    // 1. Get User
    const user = await  this.userRepository.findOneBy({ id: Equal(userId) });

    // 2. Handle errors
    //   2.1 - If user is not found
    //   2.1 - If user is deactivated
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    if(user.status === 'inactive') throw new BadRequestException('Cannot update non-active user emails');

    // 3. Get Email to delete from user
    const [deletedEmail] = await this._service.findByFilters({ address: { equal: email, in: undefined }}, userId);

    // 4. Handle error
    //   4.1 - If Email is not found
    if (!deletedEmail) throw new NotFoundException(`Email not found : ${email}`);

    // 5. Delete user email
    return this._service.remove(deletedEmail);
  }

  @ResolveField(() => User, { name: 'user' })
  async getUser(@Parent() parent: UserEmail): Promise<User> {
    return this.userRepository.findOneBy({ id: Equal(parent.userId) });
  }
}
