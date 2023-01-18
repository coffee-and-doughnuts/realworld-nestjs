import { Controller, Post, Body } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateDto, ResponseDto, LogInDto } from './user.dto'

@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService
	) { }

	@Post()
	async create(@Body('user') user: CreateDto): Promise<ResponseDto> {
		return this.userService.create(user)
	}

	@Post('login')
	async login(@Body('user') user: LogInDto): Promise<ResponseDto> {
		return this.userService.login(user)
	}
}

