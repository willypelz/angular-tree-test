import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import TreeItemNode from '../model/tree-item-node';

/** importing sample json data. **/
import * as data from '../../assets/response.json';




/**
 * The Json object for to-do list data.
 */
const TREE_API_DATA = data;


/**
 * TreeList database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export default class TreeDatabase {
    dataChange = new BehaviorSubject<TreeItemNode[]>([]);

    get data(): TreeItemNode[] { return this.dataChange.value; }

    constructor() {
        this.initialize();
    }

    initialize() {
        // Build the tree nodes from Json object. The result is a list of `TreeItemNode` with nested
        //     file node as children.
        const data = this.buildFileTree(TREE_API_DATA, 0);

        // Notify the change.
        this.dataChange.next(data);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TreeItemNode`.
     */
    buildFileTree(obj: {[key: string]: any}, level: number): TreeItemNode[] {
        return Object.keys(obj).reduce<TreeItemNode[]>((accumulator, key) => {
            let value = obj[key];
            const node = new TreeItemNode();
            node.item = value.type;
            delete value.type;


            if (value != null) {
                if (typeof value === 'object') {
                    node.children = this.buildFileTree(value, level + 1);
                    if (!node.item) node.item = 'trunk'
                } else {
                    node.item = value;
                }
            }

            return accumulator.concat(node);
        }, []);
    }
}
