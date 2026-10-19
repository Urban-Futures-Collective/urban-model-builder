import { module, test } from 'qunit';
import { setupRenderingTest } from 'hcu-urban-model-builder-client/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';
import { NodeType } from 'hcu-urban-model-builder-backend';
import type Store from '@ember-data/store';

const NODES = [
  { id: 'n1', type: NodeType.Stock, position: { x: 0, y: 0 } },
  { id: 'n2', type: NodeType.Flow, position: { x: 200, y: 20 } },
  { id: 'n3', type: NodeType.Stock, position: { x: 400, y: 0 } },
  { id: 'n4', type: NodeType.Variable, position: { x: 100, y: 120 } },
  { id: 'n5', type: NodeType.OgcApiFeatures, position: { x: 500, y: 140 } },
  { id: 'n6', type: NodeType.Ghost, position: { x: 600, y: 140 } },
];

class FeathersStub extends Service {
  requestedQueries: unknown[] = [];
  getServiceNameByModelName(modelName: string) {
    return modelName;
  }
  app = {
    service: () => ({
      find: async (params: { query: unknown }) => {
        this.requestedQueries.push(params.query);
        return { total: NODES.length, data: NODES };
      },
    }),
  };
}

module('Integration | Component | model/card', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.owner.register('service:feathers', FeathersStub);
  });

  function pushModel(store: Store, published: boolean) {
    const relationship = published
      ? 'latestPublishedVersion'
      : 'latestDraftVersion';
    const payload = {
      data: {
        id: 'model-1',
        type: 'model',
        attributes: {
          internalName: 'Housing demand Hamburg 2040',
          description: 'Population and housing stock until 2040.',
          role: 4,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        relationships: {
          [relationship]: { data: { id: 'version-1', type: 'models-version' } },
        },
      },
      included: [
        {
          id: 'version-1',
          type: 'models-version',
          attributes: {
            majorVersion: 1,
            minorVersion: published ? 1 : 0,
            draftVersion: published ? 0 : 3,
            isLatest: true,
            role: 4,
            publishedAt: published ? new Date() : null,
          },
        },
      ],
    };
    return store.push(payload as unknown as Parameters<Store['push']>[0]);
  }

  test('it shows the model as a sheet with a graph thumbnail and node mix', async function (assert) {
    const store = this.owner.lookup('service:store') as Store;
    this.set('model', pushModel(store, false));

    await render(hbs`<Model::Card @model={{this.model}} />`);
    // node data arrives asynchronously from the nodes service
    await waitFor('.model-mix__segment');

    assert.dom('.model-card__title').hasText('Housing demand Hamburg 2040');
    assert.dom('.umb-chip--draft').exists('a draft shows the dashed chip');

    const feathers = this.owner.lookup('service:feathers') as FeathersStub;
    assert.deepEqual(
      feathers.requestedQueries,
      [{ modelsVersionsId: 'version-1' }],
      'nodes are loaded for the current version only',
    );

    // Ghost nodes are not part of the model's composition.
    assert.dom('.model-thumb__node').exists({ count: 5 });
    assert.dom('.model-thumb__node--stock').exists({ count: 2 });
    assert
      .dom('.model-mix__segment')
      .exists({ count: 4 }, 'one segment per node type');
    assert.dom('.model-card__count').hasText('5 nodes');
    // 3 SD nodes (2 stocks, 1 flow) and 1 geo node among paradigm nodes
    assert.dom('.model-card__shares').includesText('SD 75 %');
    assert.dom('.model-card__shares').includesText('Geo 25 %');
  });

  test('a published model shows the solid chip', async function (assert) {
    const store = this.owner.lookup('service:store') as Store;
    this.set('model', pushModel(store, true));

    await render(hbs`<Model::Card @model={{this.model}} @featured={{true}} />`);
    await waitFor('.model-mix__segment');

    assert.dom('.umb-chip--published').exists();
    assert.dom('.model-card--featured').exists();
    assert.dom('.model-card__flag').hasText('Continue');
  });
});
