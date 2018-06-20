import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

export default function(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('Applying migration for Ignite UI for Angular to version 6.0.0');

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();
  };
}
