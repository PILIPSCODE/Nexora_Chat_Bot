import { HttpException, Injectable } from '@nestjs/common';
import { Subscribtion } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { ValidationService } from 'src/module/common/other/validation.service';
import { ChangeSubcribtion, SubcribtionApi } from 'src/model/subcribtion.model';
import { SubcribtionValidation } from '../dto/subcribtion.validation';

@Injectable()
export class SubscribtionService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getAllSubscribtion(): Promise<SubcribtionApi[]> {
    const data = await this.prismaService.subscribtion.findMany();
    return data.map((item) => ({
      ...item,
      initialToken: item.initialToken.toString(),
    }));
  }

  async getSubscribtionbyId(id: number): Promise<SubcribtionApi> {
    try {
      if (!id) throw new HttpException('Validation Error', 400);

      const data = await this.prismaService.subscribtion.findFirst({
        where: {
          id: id,
        },
      });

      if (!data) throw new HttpException('Cannot Find Subscribtion', 403);

      return {
        ...data,
        initialToken: data.initialToken?.toString(),
      };
    } catch (error) {
      throw new HttpException('SubscribtionId is Invalid', 400);
    }
  }

  async addNewSubscribtion(req: SubcribtionApi): Promise<SubcribtionApi> {
    const SubscribtionValid: SubcribtionApi = this.validationService.validate(
      SubcribtionValidation.Subcribtion,
      req,
    );

    if (!SubscribtionValid) throw new HttpException('Validation Error', 400);
    const initialToken = BigInt(SubscribtionValid.initialToken);

    const data = await this.prismaService.subscribtion.create({
      data: { ...SubscribtionValid, initialToken: initialToken },
    });

    return {
      ...data,
      initialToken: data.initialToken?.toString(),
    };
  }

  async editSubscribtion(req: ChangeSubcribtion) {
    try {
      const SubscribtionValid: ChangeSubcribtion =
        this.validationService.validate(
          SubcribtionValidation.changeSubcribtion,
          req,
        );

      const { id, ...Subscribtion } = SubscribtionValid;

      if (!SubscribtionValid) throw new HttpException('Validation Error', 400);
      const initialToken = BigInt(SubscribtionValid.initialToken);
      const data = await this.prismaService.subscribtion.update({
        where: {
          id: Number(id),
        },
        data: { ...Subscribtion, initialToken: initialToken },
      });

      return {
        ...data,
        initialToken: data.initialToken?.toString(),
      };
    } catch (error) {
      if (String(error).includes('invalid_type')) throw error;
      throw new HttpException('SubscribtionId is Invalid', 400);
    }
  }
  async deleteSubscribtion(id: number) {
    if (!id) throw new HttpException('Validation Error', 400);

    try {
      const data = await this.prismaService.subscribtion.delete({
        where: {
          id: id,
        },
      });
      return true;
    } catch (error) {
      throw new HttpException('SubscribtionId is Invalid', 400);
    }
  }
}
