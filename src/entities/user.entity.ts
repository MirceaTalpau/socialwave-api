export class User {
  userId: number;
  email: string;
  password: string;
  birthdate: Date;
  name: string;
  bio: string;
  profilePicture: string;
  coverPicture: string;
  isActivated: boolean = false;
  isAdmin: boolean = false;
  verificationToken: string;
  createdAt: Date;
  updatedAt: Date;
}
