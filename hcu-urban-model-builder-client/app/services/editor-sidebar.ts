import { action } from '@ember/object';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export type SidebarView = 'modelInfo' | 'scenarios' | 'share' | 'settings';

// Forms that open inside the "share" view instead of a modal dialog.
export type ShareAction = 'publish' | 'share' | 'clone';

// State of the editor's left panel. The editor has no modal dialogs: model
// settings, publishing, sharing and cloning all open in this panel.
export default class EditorSidebarService extends Service {
  // Start collapsed: the title block already shows the model name, so the
  // canvas stays clear until a panel is opened.
  @tracked isMinimized = true;
  @tracked activeView: SidebarView = 'modelInfo';
  @tracked shareAction: ShareAction | null = null;

  @action open(view: SidebarView) {
    this.activeView = view;
    this.isMinimized = false;
    this.shareAction = null;
  }

  @action toggleMinimized() {
    this.isMinimized = !this.isMinimized;
  }

  @action startShareAction(shareAction: ShareAction) {
    this.open('share');
    this.shareAction = shareAction;
  }

  @action endShareAction() {
    this.shareAction = null;
  }

  @action reset() {
    this.isMinimized = true;
    this.activeView = 'modelInfo';
    this.shareAction = null;
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:editor-sidebar')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('editor-sidebar') declare altName: EditorSidebarService;`.
declare module '@ember/service' {
  interface Registry {
    'editor-sidebar': EditorSidebarService;
  }
}
