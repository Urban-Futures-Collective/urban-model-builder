import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { htmlSafe, type SafeString } from '@ember/template';
import { dasherize } from '@ember/string';
import { TrackedAsyncData } from 'ember-async-data';
import { NodeType } from 'hcu-urban-model-builder-backend';
import type ModelModel from 'hcu-urban-model-builder-client/models/model';
import type FeathersService from 'hcu-urban-model-builder-client/services/feathers';
import type IntlService from 'ember-intl/services/intl';

export interface ModelCardSignature {
  Args: {
    model: ModelModel;
    featured?: boolean;
    showAuthor?: boolean;
    currentUserId?: string;
    startEditing?: (model: ModelModel) => void;
    startDeleting?: (model: ModelModel) => void;
  };
  Blocks: {
    default: [];
  };
  Element: null;
}

type RawNode = {
  id: string;
  type: NodeType;
  position?: { x: number; y: number } | null;
  width?: number | null;
  height?: number | null;
  parentId?: string | null;
};

type ThumbNode = { className: string; style: SafeString };
type MixSegment = { className: string; style: SafeString; type: string };

// Paradigm of each node type, used for the caption under the node-mix bar.
const PARADIGM: Partial<Record<NodeType, 'sd' | 'abm' | 'geo'>> = {
  [NodeType.Stock]: 'sd',
  [NodeType.Flow]: 'sd',
  [NodeType.State]: 'abm',
  [NodeType.Transition]: 'abm',
  [NodeType.Action]: 'abm',
  [NodeType.Population]: 'abm',
  [NodeType.Agent]: 'abm',
  [NodeType.OgcApiFeatures]: 'geo',
};

// Order of the segments in the node-mix bar.
const MIX_ORDER: NodeType[] = [
  NodeType.Stock,
  NodeType.Flow,
  NodeType.Variable,
  NodeType.Converter,
  NodeType.OgcApiFeatures,
  NodeType.State,
  NodeType.Transition,
  NodeType.Action,
  NodeType.Population,
  NodeType.Agent,
  NodeType.Folder,
];

const DEFAULT_SIZE: Partial<Record<NodeType, [number, number]>> = {
  [NodeType.Flow]: [120, 8],
  [NodeType.Transition]: [120, 8],
};

// Smallest canvas area (in canvas px) a thumbnail shows.
const MIN_EXTENT: [number, number] = [900, 420];

function typeClass(type: NodeType) {
  return dasherize(NodeType[type] ?? 'unknown');
}

/**
 * A model as a sheet in the library: graph thumbnail drawn from the node
 * positions of its current version, state, title and node-mix bar.
 */
export default class ModelCardComponent extends Component<ModelCardSignature> {
  @service declare feathers: FeathersService;
  @service declare intl: IntlService;

  get versionId(): string | null {
    const model = this.args.model;
    return (
      model.belongsTo('latestDraftVersion').id() ??
      model.belongsTo('latestPublishedVersion').id() ??
      null
    );
  }

  get isPublished() {
    const model = this.args.model;
    return (
      !model.belongsTo('latestDraftVersion').id() &&
      !!model.belongsTo('latestPublishedVersion').id()
    );
  }

  get isOwn() {
    return (
      !!this.args.currentUserId &&
      this.args.model.belongsTo('createdBy').id() === this.args.currentUserId
    );
  }

  @cached
  get nodesRequest(): TrackedAsyncData<RawNode[]> | null {
    const versionId = this.versionId;
    if (!versionId) {
      return null;
    }
    const load = async () => {
      const result = (await this.feathers.app
        .service('nodes')
        .find({ query: { modelsVersionsId: versionId } })) as unknown as
        | RawNode[]
        | { data?: RawNode[] };
      const data = Array.isArray(result) ? result : (result?.data ?? []);
      return data.filter((n) => n.type !== NodeType.Ghost);
    };
    return new TrackedAsyncData(load());
  }

  get nodes(): RawNode[] {
    const request = this.nodesRequest;
    return request?.isResolved ? request.value : [];
  }

  get isLoading() {
    return !!this.nodesRequest?.isPending;
  }

  get nodeCount() {
    return this.nodes.length;
  }

  /** Nodes placed in a 0..100 % box, children offset by their parent. */
  get thumbnail(): ThumbNode[] {
    const nodes = this.nodes;
    if (nodes.length === 0) {
      return [];
    }
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const absolute = (node: RawNode, depth = 0): { x: number; y: number } => {
      const own = node.position ?? { x: 0, y: 0 };
      const parent = node.parentId ? byId.get(node.parentId) : undefined;
      if (!parent || depth > 5) {
        return own;
      }
      const offset = absolute(parent, depth + 1);
      return { x: own.x + offset.x, y: own.y + offset.y };
    };

    const boxes = nodes.map((node) => {
      const pos = absolute(node);
      const [defW, defH] = DEFAULT_SIZE[node.type] ?? [150, 48];
      return {
        node,
        x: pos.x,
        y: pos.y,
        w: node.width || defW,
        h: node.height || defH,
      };
    });

    // Fit the graph into the frame, but never zoom in beyond a minimum canvas
    // extent: a model with a few nodes shows small nodes, centred.
    const left = Math.min(...boxes.map((b) => b.x));
    const top = Math.min(...boxes.map((b) => b.y));
    const right = Math.max(...boxes.map((b) => b.x + b.w));
    const bottom = Math.max(...boxes.map((b) => b.y + b.h));
    const width = Math.max(right - left, MIN_EXTENT[0]);
    const height = Math.max(bottom - top, MIN_EXTENT[1]);
    const minX = left - (width - (right - left)) / 2;
    const minY = top - (height - (bottom - top)) / 2;

    // Frames first so they sit behind their children.
    const frames = [NodeType.Folder, NodeType.Agent];
    boxes.sort(
      (a, b) =>
        Number(frames.includes(b.node.type)) -
        Number(frames.includes(a.node.type)),
    );

    return boxes.map((b) => {
      const left = ((b.x - minX) / width) * 100;
      const top = ((b.y - minY) / height) * 100;
      const w = Math.max((b.w / width) * 100, 2);
      const h = Math.max((b.h / height) * 100, 3);
      return {
        className: `model-thumb__node model-thumb__node--${typeClass(b.node.type)}`,
        style: htmlSafe(
          `left:${left.toFixed(2)}%;top:${top.toFixed(2)}%;width:${w.toFixed(2)}%;height:${h.toFixed(2)}%`,
        ),
      };
    });
  }

  get mix(): MixSegment[] {
    const total = this.nodes.length;
    if (!total) {
      return [];
    }
    const counts = new Map<NodeType, number>();
    for (const node of this.nodes) {
      counts.set(node.type, (counts.get(node.type) ?? 0) + 1);
    }
    return MIX_ORDER.filter((type) => counts.has(type)).map((type) => ({
      type: typeClass(type),
      className: `model-mix__segment model-mix__segment--${typeClass(type)}`,
      style: htmlSafe(
        `width:${(((counts.get(type) ?? 0) / total) * 100).toFixed(2)}%`,
      ),
    }));
  }

  /** Shares of the paradigms among paradigm-specific nodes, e.g. SD 60 / ABM 40. */
  get paradigms(): Array<{ key: string; percent: number }> {
    const counts = { sd: 0, abm: 0, geo: 0 };
    for (const node of this.nodes) {
      const paradigm = PARADIGM[node.type];
      if (paradigm) {
        counts[paradigm] += 1;
      }
    }
    const sum = counts.sd + counts.abm + counts.geo;
    if (!sum) {
      return [];
    }
    return (['sd', 'abm', 'geo'] as const)
      .filter((key) => counts[key] > 0)
      .map((key) => ({ key, percent: Math.round((counts[key] / sum) * 100) }));
  }
}
