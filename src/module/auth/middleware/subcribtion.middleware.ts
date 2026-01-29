// import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
// import { NextFunction, Request, Response } from 'express';
// import { JwtService } from 'src/module/auth/service/jwt.service';
// import { PrismaService } from 'src/module/prisma/service/prisma.service';

// @Injectable()
// export class Subscribtion1Middleware implements NestMiddleware {
//   constructor(private prismaService: PrismaService) {}
//   async use(req: Request, res: Response, next: NextFunction) {
//     const token = req.cookies.refresh_token;

//     if (!token) throw new HttpException('Unauthorized!!', 401);

//     try {
//       const user = await this.prismaService.account.findFirst({
//         where: {
//           refreshToken: token,
//         },
//       });

//       if (!user) throw new HttpException('Invalid Refresh token!!', 400);

//       const subcribtions = await this.prismaService.subscribtion.findMany({
//         where: {
//           priorityNumber: 1,
//         },
//         include: {
//           userSubcribtions: {
//             where: {
//               userId: user.userId,
//               endDate: {
//                 gte: new Date(),
//               },
//             },
//           },
//         },
//       });

//       if (!subcribtions.some((s) => s.userSubcribtions.length)) {
//         throw new HttpException('please subscribe this plan first!!', 400);
//       }
//       return next();
//     } catch (err) {
//       if (err.name === 'TokenExpiredError') {
//         throw new HttpException('Access token expired!!', 400);
//       }
//       throw new HttpException('Invalid access token!!', 400);
//     }
//   }
// }
