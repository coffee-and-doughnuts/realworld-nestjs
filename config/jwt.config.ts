import { JwtModuleOptions } from '@nestjs/jwt'

export const JwtConfig: JwtModuleOptions = {
	secret: "secret",
	signOptions: { expiresIn: '5m' }
}