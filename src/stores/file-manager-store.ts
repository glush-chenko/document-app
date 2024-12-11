import { makeAutoObservable, ObservableMap} from 'mobx';
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
    categories: File[] = [];
    documents: File[] = [];
    files: Map<string, FileObj[]> = new Map();
    trashItems: FileObj[] = [];
    currentCategoryPath = '';
    selectedItemsIds: string[] = []; //Categories or documents
    selectedTrashItems: FileObj[] = []; //trash items
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setCategories(categories: File[]) {
        this.categories = categories;
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

    setSelectedTrashItems(selectedItems: FileObj[]) {
        this.selectedTrashItems = selectedItems;
    }

    findCategoryByName(categoryName: string) {
        return this.categories.find(category => category.name === categoryName) || null;
    }

    removeCategoryByName () {
        const findCategory = this.findCategoryByName(this.currentCategoryPath);
        if (!findCategory) return;

        this.categories = this.categories.filter(category => category.id !== findCategory.id);

        return this.currentCategoryPath;
    }

    findItemByName(itemName: string) {
        const category = this.categories.find(category => category.name === itemName);
        if (category) {
            return category;
        }

        const document = this.documents.find(document => document.name === itemName);
        if (document) {
            return document;
        }

        return  null;
    }

    findItemById(itemId: string) {
        const category = this.categories.find(category => category.id === itemId);
        if (category) {
            return category;
        }

        const document = this.documents.find(document => document.id === itemId);
        if (document) {
            return document;
        }

        return null;
    }

    deleteDocument(file: File) {
        if (!file) return;

        this.documents = this.documents.filter(doc => doc.id !== file.id);
    }

    deleteCategory(file: File) {
        if (!file) return;

        this.categories = this.categories.filter(cat => cat.id !== file.id);
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

    replaceAllFiles(allFiles: ObservableMap<string, FileObj[]> | never[]) {
        this.files = new Map(allFiles);
    }

    setFilesByPath(path: string, files: FileObj[]) {
        const map = new Map(this.files);
        map.set(path, files);
        this.files = map;
    }

    updateDocumentsArray(documentId: string, newName: string, newPath: string) {
        this.documents = this.documents.map(doc =>
            doc.id === documentId ? { ...doc, name: newName, path: newPath} : doc
        );
    }

    updateCategoriesArray(categoryId: string, newName: string, newPath: string) {
        this.categories = this.categories.map(cat =>
            cat.id === categoryId ? { ...cat, name: newName, path: newPath } : cat
        );
    }
}

export const fileManagerStore = new FileManagerStore();
(window as any).fileManagerStore  = fileManagerStore;