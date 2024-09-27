import { makeAutoObservable } from 'mobx';
import {Category} from "../types/category";
import {Document} from "../types/document";

class CategoryStore {
    categories: Category[] = [];
    documents: Document[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    setCategories(categories: Category[]) {
        this.categories = categories;
    }

    setDocuments(documents: Document[]) {
        this.documents = documents;
    }

    getDocumentsByCategoryId(categoryId: string) {
        return this.documents.filter(doc => doc.categoryId === categoryId);
    }

    getDocumentById(documentId: string) {
        return this.documents.find(doc => doc.id === documentId) || null;
    }
}

export const categoryStore = new CategoryStore();