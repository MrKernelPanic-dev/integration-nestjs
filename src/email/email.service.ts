// Packages
import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';

// Emails
import { EmailEntity } from './email.entity';
import { IEmail, IEmailFilters } from './email.interfaces';
import { UserEmail } from './email.types';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {}

  async findById(id:string):Promise<IEmail> {
    return this.emailRepository.findOneBy({ id: Equal(id) });
  }

  async findByFilters(filters:IEmailFilters, userId?:string):Promise<UserEmail[]> {
    const where:FindOptionsWhere<EmailEntity> = {};

    if (userId) {
      where.userId = Equal(userId);
    }

    if (filters.address) {
      where.address = In([
        ...(filters.address.equal ? [filters.address.equal] : []),
        ...(filters.address.in?.length ? filters.address.in : []),
      ]);
    }

    return this.emailRepository.find({
      where,
      order: { address: 'asc' },
    });
  }

  async create(userId: string, email: string): Promise<IEmail> {
    return this.emailRepository.create({
      id: randomUUID(),
      userId,
      address: email,
    });
  }

  async remove(email: EmailEntity): Promise<IEmail> {
    return this.emailRepository.remove(email);
  }
}
