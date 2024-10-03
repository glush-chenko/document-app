import {makeAutoObservable} from 'mobx';
import {Category} from "../types/category";
import {Document} from "../types/document";
import {TrashItem} from "../types/folder";

class FileManagerStore {
    categories: Category[] = [];
    documents: Document[] = [];
    trashItems: TrashItem[] = [];
    currentCategory: string = '';
    selectedItemsIds: string[] = []; //Categories or documents

    constructor() {
        makeAutoObservable(this);
    }

    setCategories(categories: Category[]) {
        this.categories = categories;
    }

    setCurrentCategory(category: string) {
        this.currentCategory = category;
    }

    setDocuments(documents: Document[]) {
        this.documents = documents;
    }

    setTrashItems(trashItems: TrashItem[]) {
        this.trashItems = trashItems;
    }

    setSelectedItemsIds(selectedItemsIds: string[]) {
        this.selectedItemsIds = selectedItemsIds;
    }

    findCategoryByName(categoryName: string) {
        if (!categoryName) return;
        return this.categories.find(category => category.name === categoryName) || null;
    }

    getDocumentById(documentId?: string) {
        if (!documentId) return;
        return this.documents.find(doc => doc.id === documentId) || null;
    }

    // updateItemName(itemId: string, newName: string) {
    //     const item = this.findItemById(itemId);
    //     if (!item) return;
    //
    //     if (item.type === "dir") {
    //         console.log(item.name)
    //         item.name = newName;
    //     } else {
    //         console.log(item.name)
    //         item.name = newName;
    //     }
    // }

    removeCategoryByName () {
        const categories = fileManagerStore.categories;
        const currentCategory = fileManagerStore.currentCategory;

        const findCategory = fileManagerStore.findCategoryByName(currentCategory);
        if (!findCategory) return;

        const newCategories = categories.filter(category => category.id !== findCategory.id);
        fileManagerStore.setCategories(newCategories);

        return currentCategory;
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

    getTrashItems() {
        return this.trashItems;
    }
}

export const fileManagerStore = new FileManagerStore();
(window as any).fileManagerStore  = fileManagerStore;