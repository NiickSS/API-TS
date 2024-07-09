import path from "node:path";
import fs from "node:fs";
import { AppError } from "@shared/errors/appError";
import { User } from "@users/entities/User";
import { IUsersRepository } from "@users/repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";
import uploadConfig from "@config/upload";

type UpdateAvatarDTO = {
  userId: string;
  avatarFileName: string;
};

@injectable()
export class UpdateAvatarUseCase {
  constructor(
    @inject("UsersRepository") private usersRepository: IUsersRepository,
  ) {}

  async execute({ userId, avatarFileName }: UpdateAvatarDTO): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError(
        "Apenas usuários autenticados podem alterar o avatar",
        401,
      );
    }
    if (user.avatar) {
      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);
      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);
      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath);
      }
    }
    user.avatar = avatarFileName;
    return await this.usersRepository.save(user);
  }
}
