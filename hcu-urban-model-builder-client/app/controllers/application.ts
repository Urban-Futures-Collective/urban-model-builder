// app/controllers/application.js
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

// Routes that bring their own chrome: the landing page has its own header,
// the editor and the demo float their controls over the canvas.
const ROUTES_WITHOUT_RAIL = ['index', 'demo', 'models.versions.show'];

export default class ApplicationController extends Controller {
  @service router!: RouterService;

  get showRail() {
    const routeName = this.router.currentRouteName ?? '';
    return !ROUTES_WITHOUT_RAIL.includes(routeName);
  }
}
