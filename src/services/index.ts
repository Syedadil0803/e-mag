import './axios.config';
import { common } from '@demo/services/common';
import { article } from './article';
import { user } from './user';
import { template } from './template';
import rbac from './rbac';

const services = {
  common,
  article,
  user,
  template,
  rbac,
};

export default services;

