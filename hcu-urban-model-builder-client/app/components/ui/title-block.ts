import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type ModelsVersion from 'hcu-urban-model-builder-client/models/models-version';
import type ApplicationStateService from 'hcu-urban-model-builder-client/services/application-state';

export interface UiTitleBlockSignature {
  Args: {
    modelVersion: ModelsVersion;
  };
  Blocks: {
    default: [];
  };
  Element: null;
}

/**
 * Floating title block of the editor. Replaces the top navbar and the
 * breadcrumb bar: back to the library, model name, version and state.
 */
export default class UiTitleBlockComponent extends Component<UiTitleBlockSignature> {
  @service declare applicationState: ApplicationStateService;

  get isReadOnly() {
    return !this.applicationState.isDemoMode && !this.args.modelVersion.canEdit;
  }
}
