import Component from '@glimmer/component';
import { action } from '@ember/object';

interface ModelsIndexHeaderArgs {
  title: string;
  intro?: string;
  total?: number;
  canCreate?: boolean;
  hasSearchQuery: boolean;
  searchQuery: string;
  clearSearch: () => void;
  onSearchInput: (event: Event) => void;
  onSearchChange: () => void;
  sort_key: string;
  sort_direction: number;
  onSortChange: (key: string, direction: number) => void;
  startCreating: () => void;
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

export default class ModelsIndexHeader extends Component<ModelsIndexHeaderArgs> {
  @action submitSearch(event: Event) {
    event.preventDefault();
    this.args.onSearchChange();
  }
}
