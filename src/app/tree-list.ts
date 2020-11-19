import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import TreeItemFlatNode from './model/tree-item-flat-node';
import TreeDatabase from './service/data-formatter';
import TreeItemNode from './model/tree-item-node';


@Component({
  selector: 'tree-list',
  templateUrl: 'tree-list.html',
  styleUrls: ['tree-list.css'],
  providers: [TreeDatabase]
})
export class TreeList extends TreeDatabase {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TreeItemFlatNode, TreeItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeItemNode, TreeItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TreeItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TreeItemFlatNode>;

  treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;

  /** The selection for TreeList */
  treeListSelection = new SelectionModel<TreeItemFlatNode>(true /* multiple */);

  constructor(private _database: TreeDatabase) {
    super();
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  getLevel = (node: TreeItemFlatNode) => node.level;

  isExpandable = (node: TreeItemFlatNode) => node.expandable;

  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;


  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new TreeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }
}
