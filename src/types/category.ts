import {File} from "../stores/file-manager-store";

export interface Category {
    id: string;
    name: string;
    type: 'dir';
    items?: File[];
    created: string;
    path: string;
}