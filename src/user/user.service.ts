import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateDto, ResponseDto, LogInDto } from './user.dto';
import * as argon2 from 'argon2'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(body: CreateDto): Promise<ResponseDto> {
    const exist_user = await this.userRepository.find({where: {email: body.email}})

    if (exist_user.length != 0) {
      const errors = {email: 'email must be unique'}
      throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.CONFLICT)
    }

    const new_user = new User()
    new_user.email = body.email;
    new_user.username = body.username;
    new_user.hashed_password = await argon2.hash(body.password);

    // TODO: validate user
    const saved_user = await this.userRepository.save(new_user)
    return this.responseUser(saved_user)
  }

  async login(body: LogInDto): Promise<ResponseDto> {
    const user = await this.userRepository.findOneBy({email: body.email})

    if (!user) {
      throw new HttpException({message: 'Wrong email and password'}, HttpStatus.UNAUTHORIZED)
    }

    return this.responseUser(user)
  }

  private async responseUser(user: User): Promise<ResponseDto> {
    const token = await this.jwtService.signAsync({
      email: user.email,
      username: user.username,
    })

    const response: ResponseDto = {
      username: user.username,
      email: user.email,
      bio: user.bio,
      image: user.image,
      token,
    }

    return response
  }
}
