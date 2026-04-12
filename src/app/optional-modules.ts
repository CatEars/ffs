import { OptionalModule } from '../lib/optional-module/optional-module.ts';
import { diskUsageModule } from './disk-usage/module.ts';
import { pluginsModule } from './plugins/module.ts';
import { thumbnailsModule } from './thumbnails/module.ts';

export const optionalModules: OptionalModule[] = [pluginsModule, thumbnailsModule, diskUsageModule];
