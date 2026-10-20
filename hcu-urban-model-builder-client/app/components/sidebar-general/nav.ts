import Component from '@glimmer/component';
import { service } from '@ember/service';
import type ModelsVersion from 'hcu-urban-model-builder-client/models/models-version';
import type ApplicationStateService from 'hcu-urban-model-builder-client/services/application-state';
import type { SidebarView } from 'hcu-urban-model-builder-client/services/editor-sidebar';

export interface SidebarGeneralNavSignature {
  // The arguments accepted by the component
  Args: {
    activeView: SidebarView;
    isMinimized: boolean;
    minimize: () => void;
    selectActiveView: (view: SidebarView) => void;
    modelVersion: ModelsVersion;
    views?: SidebarView[];
  };
  // Any blocks yielded by the component
  Blocks: {
    default: [];
  };
  // The element to which `...attributes` is applied in the component template
  Element: null;
}

export default class SidebarGeneralNavComponent extends Component<SidebarGeneralNavSignature> {
  @service declare applicationState: ApplicationStateService;

  get navItems() {
    const items: { id: SidebarView; icon: string }[] = [
      {
        id: 'modelInfo',
        icon: 'info',
      },
      {
        id: 'scenarios',
        icon: 'tune',
      },
      {
        id: 'share',
        icon: 'share',
      },
      {
        id: 'settings',
        icon: 'settings',
      },
    ];
    // the demo model has no permissions but its settings are editable
    const canEditSettings =
      this.args.modelVersion?.canEdit || this.applicationState.isDemoMode;

    return items.filter(
      (item) =>
        (!this.args.views || this.args.views.includes(item.id)) &&
        (item.id !== 'settings' || canEditSettings),
    );
  }
}
