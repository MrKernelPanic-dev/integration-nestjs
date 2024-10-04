// Packages
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';

// Users
import { UserService } from './user/user.service';
import { UserResolver } from './user/user.resolver';
import { UserEntity } from './user/user.entity';

// Emails
import { EmailResolver } from './email/email.resolver';
import { EmailService } from './email/email.service';
import { EmailEntity } from './email/email.entity';

config({});

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PW,
      database: process.env.POSTGRES_DB,
      entities: [UserEntity, EmailEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserEntity, EmailEntity]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [UserResolver, EmailResolver, UserService, EmailService],
})
export class AppModule {}
