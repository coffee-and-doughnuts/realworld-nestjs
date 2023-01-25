export class UserData {
  username: string;
  email: string;
  token: string;
  bio: string;
  image: string;
}

export class UserResponse {
  user: UserData;

  constructor(user: UserData) {
    this.user = user
  }
}