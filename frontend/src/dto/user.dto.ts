export class UserDto {
  username!: string;
  password!: string;
}

export class UserInDto {
  _id!: string;
  username!: string;
}

export class UserIdTokenDto extends UserInDto {
  token!: string;
}
