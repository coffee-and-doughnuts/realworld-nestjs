import { JwtModuleOptions } from '@nestjs/jwt'

const options: JwtModuleOptions = {
	secret: "secret",
	signOptions: { expiresIn: '60s' }
}

export default options
