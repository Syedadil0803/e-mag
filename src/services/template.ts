import { AdvancedType, BasicType, BlockManager } from 'easy-email-core';
import { request } from './axios.config';
import { IEmailTemplate } from 'easy-email-editor';

export const template = {
  async getTemplate(templateName: number | string, token: string): Promise<ITemplate> {
    return request.get<ITemplate>(`/email/template/get`, {
      params: {
        templateName,
        token,
      },
    });
  },
  async updateArticle(
    templateName,
    subject,
    html,
    text,
    id,
    helperJson,
  ): Promise<ITemplate> {
    return request.post<ITemplate>('/email/template/update', {
      templateName,
      subject,
      html,
      text,
      id,
      helperJson: typeof helperJson === 'string' ? helperJson : JSON.stringify(helperJson),
    });
  },
  fetchDefaultTemplate:  () => {
    const pageBlock = BlockManager.getBlockByType(BasicType.PAGE)?.create({
      // @ts-ignore: Object is possibly 'null'.
        attributes: {
          width: '1100px',
        },
    });
    if (pageBlock) {
      pageBlock.children = [];
    }
    return {
      subject: 'Welcome to E-Magazine',
      subTitle: 'Nice to meet you!',
      content: pageBlock,
    } as IEmailTemplate;
  },
  fetchDefaultTemplateOriginalData:  () => {
    const pageBlock = BlockManager.getBlockByType(BasicType.PAGE)?.create({
      // @ts-ignore: Object is possibly 'null'.
        attributes: {
          width: '1100px',
        },
    });
    if (pageBlock) {
      pageBlock.children = [];
    }
    return {
      subject: 'Welcome to E-Magazine',
      subTitle: 'Nice to meet you!',
      content: pageBlock,
    } as IEmailTemplate;
  },
}
export interface ITemplate {
  templateName: string;
  subject: string;
  html: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  id: number;
  helperJson: any;
}
