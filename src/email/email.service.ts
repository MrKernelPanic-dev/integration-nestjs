import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';
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
    let where: FindOptionsWhere<EmailEntity> = {};

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
}

