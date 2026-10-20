import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type FeathersService from 'hcu-urban-model-builder-client/services/feathers';

export interface UiAppRailSignature {
  Args: Record<string, never>;
  Blocks: {
    default: [];
  };
  Element: null;
}

export default class UiAppRailComponent extends Component<UiAppRailSignature> {
  @service declare session: {
    isAuthenticated: boolean;
    data?: { authenticated?: { userinfo?: { name?: string } } };
    singleLogout(): void;
  };
  @service intl!: IntlService;
  @service feathers!: FeathersService;

  get userName(): string {
    return this.session.data?.authenticated?.userinfo?.name ?? '';
  }

  get initials(): string {
    const parts = this.userName.trim().split(/\s+/).filter(Boolean);
    const letters = parts.map((part) => part[0]).join('');
    return (letters.slice(0, 2) || '?').toUpperCase();
  }

  get otherLocale() {
    return this.intl.primaryLocale === 'de-de' ? 'en-us' : 'de-de';
  }

  get otherLocaleName() {
    return this.otherLocale === 'de-de' ? 'DE' : 'EN';
  }

  @action toggleLocale() {
    // Read once: otherLocale flips as soon as setLocale runs.
    const locale = this.otherLocale;
    this.intl.setLocale(locale);
    localStorage.setItem('locale', locale);
    window.location.reload();
  }

  @action invalidateSession() {
    this.session.singleLogout();
    this.feathers.app.logout();
  }
}
