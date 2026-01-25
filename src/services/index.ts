import './axios.config';
import { common } from '@demo/services/common';
import { article } from './article';
import { user } from './user';
import { template } from './template';
import rbac from './rbac';
import content from './content';
import editor from './editor';

const services = {
  common,
  article,
  user,
  template,
  rbac,
  content,
  editor,
};

export default services;

