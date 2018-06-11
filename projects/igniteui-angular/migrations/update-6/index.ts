import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { normalize } from '@angular-devkit/core';
import {
  chain,
  FileEntry,
  filter,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';
import { filterSourceDirs } from '../common/filterSourceDirs';
import { UpdateChanges } from '../common/UpdateChanges';

export default function(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('Applying migration for Ignite UI for Angular to version 6.0.0');
    return chain([
      filterSourceDirs(host, context),
       // tslint:disable-next-line:no-shadowed-variable
       (host: Tree, context: SchematicContext) => {
        const update = new UpdateChanges(__dirname, host, context);
        update.applyChanges();
      }
    ])(host, context);

  };
}
