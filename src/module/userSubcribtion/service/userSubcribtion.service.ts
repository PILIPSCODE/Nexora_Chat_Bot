import { HttpException, Injectable } from '@nestjs/common';
import { Subscribtion, UserSubcribtion } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { ValidationService } from 'src/module/common/other/validation.service';
import {
  ChangeUserSubcribtion,
  UserSubcribtionApi,
} from 'src/model/userSubcribtion.model';
import { UserSubcribtionValidation } from '../dto/userSubcribtion.validation';

@Injectable()
export class UserSubscribtionService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getAllUserSubscribtion(): Promise<UserSubcribtion[]> {
    const data = await this.prismaService.userSubcribtion.findMany();
    return data;
  }

  async getUserSubscribtionbyId(id: string): Promise<UserSubcribtion> {
    try {
      if (!id) throw new HttpException('Validation Error', 400);

      const data = await this.prismaService.userSubcribtion.findFirst({
        where: {
          id: id,
        },
      });

      if (!data) throw new HttpException('Cannot Find UserSubscribtion', 403);

      return data;
    } catch (error) {
      throw new HttpException('UserSubscribtionId is Invalid', 400);
    }
  }

  async addNewUserSubscribtion(
    req: UserSubcribtionApi,
  ): Promise<UserSubcribtionApi> {
    const UserSubscribtionValid: UserSubcribtionApi =
      this.validationService.validate(
        UserSubcribtionValidation.UserSubcribtion,
        req,
      );

    if (!UserSubscribtionValid)
      throw new HttpException('Validation Error', 400);

    const subcribtion = await this.prismaService.subscribtion.findUnique({
      where: {
        id: UserSubscribtionValid.subcribtionId,
      },
    });

    if (!subcribtion) throw new HttpException('Validation Error', 400);

    const findSubcribtion = await this.prismaService.userSubcribtion.findFirst({
      where: {
        userId: UserSubscribtionValid.userId,
      },
    });

    let startDate = new Date();
    let endDate = new Date();
    let token = subcribtion.initialToken || BigInt(0);

    if (findSubcribtion && findSubcribtion.endDate) {
      endDate = new Date(findSubcribtion.endDate);
      token += findSubcribtion.tokenRemain;
      startDate = findSubcribtion.startDate;
    }

    const durationDays = Number(subcribtion.durationDays);

    endDate = new Date(endDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const data = await this.prismaService.userSubcribtion.create({
      data: {
        ...UserSubscribtionValid,
        tokenRemain: token,
        startDate,
        endDate,
      },
    });

    return { ...data, tokenRemain: String(data.tokenRemain) };
  }

  async findByUserId(userId: string) {
    const data = await this.prismaService.userSubcribtion.findFirst({
      where: {
        userId: userId,
      },
    });
    return data;
  }

  async updateToken(userId: string, tokenUsage: bigint) {
    const data = await this.findByUserId(userId);
    if (data) {
      const token = data.tokenRemain - tokenUsage;

      if (token < 0) {
        await this.prismaService.userSubcribtion.update({
          where: {
            id: data?.id,
          },
          data: {
            tokenRemain: 0,
          },
        });
      } else {
        await this.prismaService.userSubcribtion.update({
          where: {
            id: data?.id,
          },
          data: {
            tokenRemain: token,
          },
        });
      }
    }
  }

  // async addNewUserSubscribtionWithPriority(
  //   req: UserSubcribtionApi,
  // ): Promise<UserSubcribtionApi> {
  //   const UserSubscribtionValid: UserSubcribtionApi =
  //     this.validationService.validate(
  //       UserSubcribtionValidation.UserSubcribtion,
  //       req,
  //     );

  //   if (!UserSubscribtionValid)
  //     throw new HttpException('Validation Error', 400);

  //   const subcribtion = await this.prismaService.subscribtion.findUnique({
  //     where: {
  //       id: UserSubscribtionValid.subcribtionId,
  //     },
  //   });

  //   if (!subcribtion) throw new HttpException('Validation Error', 400);

  //   const Duration = await this.addDuration(
  //     UserSubscribtionValid.userId,
  //     subcribtion,
  //   );

  //   const data = await this.prismaService.userSubcribtion.create({
  //     data: {
  //       ...UserSubscribtionValid,
  //       startDate: Duration.startDate,
  //       endDate: Duration.endDate,
  //     },
  //   });

  //   const res: UserSubcribtionApi = data;
  //   return res;
  // }

  // async addDuration(userId: string, newSub: Subscribtion) {
  //   const now = new Date();

  //   const activeSubs = await this.prismaService.userSubcribtion.findMany({
  //     where: {
  //       userId,
  //     },
  //     include: {
  //       subcribtion: true,
  //     },
  //     orderBy: {
  //       startDate: 'asc',
  //     },
  //   });

  //   const lowerPrioritySubs = activeSubs.filter(
  //     (s) => s.subcribtion.priorityNumber > newSub.priorityNumber,
  //   );

  //   const higherOrSamePrioritySubs = activeSubs.filter(
  //     (s) => s.subcribtion.priorityNumber <= newSub.priorityNumber,
  //   );

  //   let startDate = now;

  //   if (higherOrSamePrioritySubs.length > 0) {
  //     const lastHigh =
  //       higherOrSamePrioritySubs[higherOrSamePrioritySubs.length - 1];
  //     startDate = lastHigh.endDate;
  //   }

  //   const endDate = new Date(startDate);
  //   endDate.setDate(endDate.getDate() + newSub.durationDays);

  //   let shiftStart = endDate;

  //   for (const sub of lowerPrioritySubs) {
  //     const durationDays = Math.ceil(
  //       (sub.endDate.getTime() - sub.startDate.getTime()) /
  //         (1000 * 60 * 60 * 24),
  //     );

  //     const shiftedEnd = new Date(shiftStart);
  //     shiftedEnd.setDate(shiftedEnd.getDate() + durationDays);

  //     await this.prismaService.userSubcribtion.update({
  //       where: { id: sub.id },
  //       data: {
  //         startDate: shiftStart,
  //         endDate: shiftedEnd,
  //       },
  //     });

  //     shiftStart = shiftedEnd;
  //   }

  //   return {
  //     startDate: startDate,
  //     endDate: endDate,
  //   };
  // }

  async editUserSubscribtion(req: ChangeUserSubcribtion) {
    try {
      const UserSubscribtionValid: ChangeUserSubcribtion =
        this.validationService.validate(
          UserSubcribtionValidation.changeUserSubcribtion,
          req,
        );

      if (!UserSubscribtionValid)
        throw new HttpException('Validation Error', 400);

      const tokenRemain = BigInt(UserSubscribtionValid.tokenRemain);
      const data = await this.prismaService.userSubcribtion.update({
        where: {
          id: req.id,
        },
        data: { ...UserSubscribtionValid, tokenRemain: tokenRemain },
      });

      return { ...data, tokenRemain: String(data.tokenRemain) };
    } catch (error) {
      if (String(error).includes('invalid_type')) throw error;
      throw new HttpException('UserSubscribtionId is Invalid', 400);
    }
  }
  async deleteUserSubscribtion(id: string) {
    if (!id) throw new HttpException('Validation Error', 400);

    try {
      const data = await this.prismaService.userSubcribtion.delete({
        where: {
          id: id,
        },
      });
      return true;
    } catch (error) {
      throw new HttpException('UserSubscribtionId is Invalid', 400);
    }
  }
}
