import Component from '@glimmer/component';
import { service } from '@ember/service';
import type ModelsVersion from 'hcu-urban-model-builder-client/models/models-version';
import { ensureSafeComponent } from '@embroider/util';
import { importSync } from '@embroider/macros';
import { dasherize } from '@ember/string';
import type EditorSidebarService from 'hcu-urban-model-builder-client/services/editor-sidebar';
import type { SidebarView } from 'hcu-urban-model-builder-client/services/editor-sidebar';

export interface SidebarGeneralSignature {
  // The arguments accepted by the component
  Args: {
    model: ModelsVersion;
    // Views to offer; all of them when omitted (the demo shows only settings)
    views?: SidebarView[];
  };
  // Any blocks yielded by the component
  Blocks: {
    default: [];
  };
  // The element to which `...attributes` is applied in the component template
  Element: null;
}

export default class SidebarGeneralComponent extends Component<SidebarGeneralSignature> {
  @service declare editorSidebar: EditorSidebarService;

  get sidebarViewComponent() {
    const activeView = this.editorSidebar.activeView;
    if (!activeView) {
      return null;
    }
    try {
      const fileName = dasherize(activeView);
      const module = importSync(`./sidebar-general/views/${fileName}`) as any;

      return ensureSafeComponent(module.default, this);
    } catch (e) {
      console.debug(e);
      return null;
    }
  }

  willDestroy() {
    super.willDestroy();
    // the next model opens with a collapsed panel again
    this.editorSidebar.reset();
  }
}
