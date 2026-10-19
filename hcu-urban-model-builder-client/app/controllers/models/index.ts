import { next } from '@ember/runloop';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
import type ModelModel from 'hcu-urban-model-builder-client/models/model';
import ModelValidations from '../../validations/model';
import lookupValidator from 'ember-changeset-validations';
import { Changeset, EmberChangeset } from 'ember-changeset';
import IntlService from 'ember-intl/services/intl';
import { isEmpty } from '@ember/utils';
import type UserService from 'hcu-urban-model-builder-client/services/user';

const VIEW_STORAGE_KEY = 'umb-library-view';

function readStoredView(): 'grid' | 'table' {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'table'
      ? 'table'
      : 'grid';
  } catch {
    return 'grid';
  }
}

export default class ModelsIndexController extends Controller<ModelModel[]> {
  @service declare store: Store;
  @service intl!: IntlService;
  @service declare user: UserService;

  @tracked isModalOpen = false;
  @tracked changeset!: EmberChangeset;
  @tracked mode = '';
  @tracked sort_key = 'updatedAt';
  @tracked sort_direction: number = -1;
  @tracked page = 1;
  @tracked limit = 10;
  @tracked q = '';
  @tracked _q = '';
  @tracked view: 'grid' | 'table' = readStoredView();

  queryParams = ['sort_key', 'sort_direction', 'page', 'limit', 'q'];

  get Validation() {
    return ModelValidations(this.intl);
  }

  get persistedModels() {
    return this.model.filter((item) => !item.isNew);
  }

  get hasSearchQuery() {
    return !isEmpty(this.q);
  }

  get total(): number {
    const meta = (this.model as unknown as { meta?: { total?: number } }).meta;
    return meta?.total ?? this.persistedModels.length;
  }

  // The first card on the first page of "My models" is shown large, as the
  // model to continue with, when the list is sorted by recency.
  get featureFirst() {
    return (
      this.view === 'grid' &&
      this.page === 1 &&
      !this.hasSearchQuery &&
      this.sort_key === 'updatedAt' &&
      this.sort_direction === -1
    );
  }

  @action
  async submitModel() {
    await this.changeset.validate();

    if (this.changeset.isValid) {
      await this.changeset.save();
      this.closeModal();
    } else {
      console.error('Validation failed');
    }
  }

  @action openModal() {
    this.isModalOpen = true;
  }

  @action closeModal() {
    if (this.changeset.get('isDirty')) {
      const yes = confirm(this.intl.t('actions.unsaved_changes'));
      if (yes && this.changeset['isNew']) {
        this.changeset.get('_content').deleteRecord();
      } else if (yes) {
        this.changeset.rollback();
      } else {
        return false;
      }
    } else if (!this.changeset.isDirty && this.changeset['isNew']) {
      this.changeset.get('_content').deleteRecord();
    }

    this.mode = '';
    this.isModalOpen = false;
  }

  @action startCreating() {
    this.mode = 'create';
    const modelModel = this.store.createRecord('model', {
      internalName: '',
      description: '',
    }) as ModelModel;

    this.changeset = Changeset(
      modelModel,
      lookupValidator(this.Validation),
      this.Validation,
    );

    this.openModal();
  }

  @action
  startEditing(modelModel: ModelModel) {
    this.mode = 'edit';
    this.changeset = Changeset(
      modelModel,
      lookupValidator(this.Validation),
      this.Validation,
    );

    this.openModal();
  }

  @action
  startDeleting(model: ModelModel) {
    const yes = confirm(this.intl.t('actions.confirm_delete_model'));
    if (yes) {
      model.destroyRecord();
    }
  }

  @action onSortChange(key: string, direction: number) {
    this.page = 1;
    this.sort_key = key;
    this.sort_direction = direction;
  }

  @action onPageChanged(pageNum: number) {
    this.page = pageNum;
  }

  @action onLimitChanged(limit: number) {
    this.limit = limit;
    this.page = 1;
  }

  @action onSearchChange() {
    this.q = this._q;
  }

  @action onSearchInput(event: Event) {
    this._q = (event.target as HTMLInputElement).value;
  }

  @action onShowSearch() {
    this._q = this.q;
    next(() => {
      (
        document.getElementById('model-search-input') as HTMLInputElement
      )?.select();
    });
  }

  @action clearSearch() {
    this._q = '';
    this.onSearchChange();
  }

  @action onViewChange(view: 'grid' | 'table') {
    this.view = view;
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // storage unavailable: keep the choice for this session only
    }
  }
}
