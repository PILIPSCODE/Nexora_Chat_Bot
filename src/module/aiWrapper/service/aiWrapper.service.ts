import { Injectable } from '@nestjs/common';
import { ConversationWrapper } from 'src/model/aiWrapper.model';
import { ValidationService } from 'src/module/common/other/validation.service';
import { AiWrapperValidation } from '../dto/aiWrapper.validation';
import { ConversationService } from 'src/module/conversation/service/conversation.service';
import { MessageService } from 'src/module/message/service/message.service';
import { UserAgent } from '@prisma/client';
import { CustomerServiceWorkFlow } from '../Workflow/customerService.workflow';
import {
  AiResponse,
  MessageResponse,
  WrappedResponse,
} from 'src/model/Rag.model';
import { GatewayEventService } from 'src/module/gateway/gatewayEventEmiter';
import { UserSubscribtionService } from 'src/module/userSubcribtion/service/userSubcribtion.service';

@Injectable()
export class AiService {
  constructor(
    private validationService: ValidationService,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private userSubcribtionService: UserSubscribtionService,
    private gatewayEventService: GatewayEventService,
    private customerServiceWorkFlow: CustomerServiceWorkFlow,
  ) {}

  async wrapper(req: ConversationWrapper, agent: UserAgent) {
    const ReqValid: ConversationWrapper = this.validationService.validate(
      AiWrapperValidation.aiWrapper,
      req,
    );
    let aiResponse: AiResponse = new AiResponse();

    if (!ReqValid) return;

    const tokenCheck = await this.TokenCheck(agent.userId);

    if (!tokenCheck) return;

    if (ReqValid.integrationType === 'testBot') {
      const res = await this.aiResponses(agent, req.message.text, agent.id);
      if (!res) return;

      const data: AiResponse = {
        messages: JSON.parse(res.answer),
        tokenUsage: res.tokenUsage,
      };
      aiResponse = data;
      return aiResponse;
    }

    const conversation =
      await this.conversationService.addNewConversation(ReqValid);

    if (conversation.humanHandle) {
      return undefined;
    }

    const dataUser = await this.messageService.addNewMessage({
      role: 'user',
      type: 'text',
      sentiment: 'netral',
      conversationId: conversation.id,
      message: ReqValid.message,
    });

    if (dataUser) {
      this.gatewayEventService.emitToUser(
        `room:${conversation.room}`,
        'conversation',
        dataUser,
      );
    }
    const res = await this.aiResponses(
      agent,
      req.message.text,
      conversation.room,
    );
    if (!res) return;
    const data: AiResponse = {
      messages: JSON.parse(res.answer),
      tokenUsage: res.tokenUsage,
    };
    aiResponse = data;

    if (!aiResponse || aiResponse.messages.length === 0) return;

    aiResponse.messages.map(async (e) => {
      const dataBot = await this.messageService.addNewMessage({
        role: 'Bot',
        sentiment: 'netral',
        type: 'text',
        conversationId: conversation.id,
        message: e,
      });
      if (dataBot) {
        this.gatewayEventService.emitToUser(
          `room:${conversation.room}`,
          'conversation',
          dataBot,
        );
      }
    });

    return aiResponse;
  }

  async TokenCheck(userId: string) {
    const data = await this.userSubcribtionService.findByUserId(userId);

    if (data) {
      return data?.tokenRemain > 0;
    }
  }

  cleanJsonGemini(text: string): string {
    return text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  async aiResponses(agent: UserAgent, message: string, room: string) {
    const response: WrappedResponse | undefined = await this.chooseAgent(
      agent,
      message,
      room,
    );

    if (!response) return;

    let res = response;

    return res;
  }

  async chooseAgent(agent: UserAgent, message: string, room: string) {
    let response: WrappedResponse | undefined;
    switch (agent.agent) {
      case 'customer-service':
        response = await this.customerServiceWorkFlow.workflow(
          agent,
          message,
          room,
        );
        break;

      default:
        break;
    }
    return response;
  }
}
