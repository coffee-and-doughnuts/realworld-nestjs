import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateDto, ResponseDto, LogInDto } from './user.dto';
import { Result, Ok, Err } from '@sniptt/monads';

type CreateUserError = 'UserNotFound' | 'EmailMustBeUnique';
type LoginError = 'username not found';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: CreateDto): Promise<Result<ResponseDto, CreateUserError>> {
    const exist_user = await this.userRepository.findOneBy({
      email: dto.email,
    });

    if (exist_user) {
      return Err('EmailMustBeUnique');
    }

    const new_user = await dto.toUser();

    // TODO: validate user
    const saved_user = await this.userRepository.save(new_user);
    const response = await this.signUser(saved_user) 
    return Ok(response);
  }

  async login(dto: LogInDto): Promise<Result<ResponseDto, LoginError>> {
    const exist_user = await this.userRepository.findOneBy({
      email: dto.email,
    });

    if (!exist_user) {
      return Err('username not found');
    }

    const response = await this.signUser(exist_user)
    return Ok(response);
  }

  private async signUser(user: User): Promise<ResponseDto> {
    const token = await this.jwtService.signAsync({
      email: user.email
    })

    return ResponseDto.fromUser(user, token)
  }
}
