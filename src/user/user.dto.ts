export class CreateDto {
	readonly username: string
	readonly password: string
	readonly email: string
}

export class ResponseDto {
	readonly email: string
	readonly username: string
	readonly bio: string
	readonly image: string
	readonly token: string
}

export class LogInDto {
	readonly email: string;
	readonly password: string;
}
