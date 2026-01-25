import { AdvancedType, BasicType, BlockManager } from 'easy-email-core';
import { request } from './axios.config';
import { IEmailTemplate } from 'easy-email-editor';
import { getMockTemplate } from './mockTemplates';

export const template = {
  async getTemplate(templateName: number | string, token: string): Promise<ITemplate> {
    const id = Number(templateName);
    if (id === 1 || id === 2) {
      const mockData = getMockTemplate(id);
      return {
        templateName: id === 1 ? 'University Chronicle' : 'The Campus Review',
        subject: 'University Chronicle',
        html: '',
        text: 'Autumn Edition',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: 1,
        helperJson: JSON.stringify(mockData),
      };
    }
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
  fetchDefaultTemplate: () => {
    const pageBlock = BlockManager.getBlockByType(BasicType.PAGE)?.create({
      attributes: {
        width: '794px',
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
  fetchDefaultTemplateOriginalData: () => {
    const pageBlock = BlockManager.getBlockByType(BasicType.PAGE)?.create({
      attributes: {
        width: '794px',
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
