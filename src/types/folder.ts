import {Document} from "./document";

export interface Folder {
    public_key: string;
    name: string;
    type: 'dir';
    created: string;
    modified: string;
    path: string;
}

export type TrashItem = Document | Folder;