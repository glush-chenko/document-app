import {makeAutoObservable, ObservableMap} from 'mobx';
import {Category} from "../types/category";
import {Document} from "../types/document";

export type File = Document | Category;

export interface FileObj {
    id: string;
    name: string;
    category?: string;
    preview?: string;
    url?: string;
    path: string;
    created: string;
    type: 'file' | 'dir';
    items: FileObj[]
}

class FileManagerStore {
    files: Map<string, FileObj[]> = new Map();
    trashItems: FileObj[] = [];
    currentCategoryPath = '';
    selectedItemsIds: string[] = []; //Categories or documents
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setCurrentCategoryPath(path: string) {
        this.currentCategoryPath = path;
    }

    setLoading(loading: boolean) {
        this.loading = loading;
    }

    setTrashItems(trashItems: FileObj[]) {
        this.trashItems = trashItems;
    }

    setSelectedItemsIds(selectedItemsIds: string[]) {
        this.selectedItemsIds = selectedItemsIds;
    }

    moveFiles(currentPath: string, newPath: string, id: string) {
        let filesByCurrentPath = this.getFilesByPath(currentPath);
        const targetFile = filesByCurrentPath.find((file) => file.id === id);

        if (!targetFile) return;

        filesByCurrentPath = filesByCurrentPath.filter((file) => file.id !== id);
        this.deleteFile(targetFile.path, targetFile.id);

        const filesByNewPath = this.getFilesByPath(newPath);
        filesByNewPath.push(targetFile);

        targetFile.category = newPath;

        const map = new Map(this.files);
        map.set(currentPath, filesByCurrentPath);
        map.set(newPath, filesByNewPath);
        this.files = map;
    }

    renameFile(currentPath: string, newName: string, id: string) {
        let filesByCurrentPath = this.getFilesByPath(currentPath);
        const targetFile = filesByCurrentPath.find((file) => file.id === id);

        if (!targetFile) return;

        targetFile.name = newName;

        const map = new Map(this.files);
        map.set(currentPath, filesByCurrentPath);
        this.files = map;
    }

    getFileIndexById(path: string, id: string): number {
        const filesByPath = this.getFilesByPath(path);
        return filesByPath.findIndex(file => file.id === id);
    }

    deleteFile(path: string, id: string) {
        const map = new Map(this.files);
        map.set(path, this.getFilesByPath(path).filter((file) => file.id !== id));
        this.files = map;
    }

    getFilesByPath(path: string) {
        return this.files.get(path) || [];
    }

    getFileById(path: string, id: string) {
        return this.getFilesByPath(path).find(file => file.id === id);
    }

    getAllDocuments(): FileObj[] {
        return Array.from(this.files.values()).flat().filter((f) => f.type === "file");
    }

    findFileById(id: string) {
        let foundFile: FileObj | undefined;

        this.files.forEach((filesArray) => {
            const file = filesArray.find(file => file.id === id);
            if (file) {
                foundFile = file;
            }
        });

        return foundFile;
    }

    findTrashItemById(id: string) {
        return this.trashItems.find(item => item.id === id);
    }

    replaceAllFiles(allFiles: ObservableMap<string, FileObj[]> | never[]) {
        this.files = new Map(allFiles);
    }

    setFilesByPath(path: string, files: FileObj[]) {
        const map = new Map(this.files);
        map.set(path, files);
        this.files = map;
    }
}

export const fileManagerStore = new FileManagerStore();
(window as any).fileManagerStore = fileManagerStore;