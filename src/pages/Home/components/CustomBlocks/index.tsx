import { BlockManager } from 'easy-email-core';
import { BlockAttributeConfigurationManager } from 'easy-email-extensions';
import { CustomBlocksType } from './constants';
import { Panel as ProductRecommendationPanel, ProductRecommendation } from './ProductRecommendation';
import { Panel as VideoPanel, Video } from './Video';
import { Panel as AudioPanel, Audio } from './Audio';

BlockManager.registerBlocks({
  [CustomBlocksType.PRODUCT_RECOMMENDATION]: ProductRecommendation,
  [CustomBlocksType.VIDEO]: Video,
  [CustomBlocksType.AUDIO]: Audio,
});

BlockAttributeConfigurationManager.add({
  [CustomBlocksType.PRODUCT_RECOMMENDATION]: ProductRecommendationPanel,
  [CustomBlocksType.VIDEO]: VideoPanel,
  [CustomBlocksType.AUDIO]: AudioPanel,
});
