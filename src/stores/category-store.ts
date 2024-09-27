import { makeAutoObservable } from 'mobx';

class NavigationStore {
    selectedDocumentId: string | null = null;
    selectedCategoryId: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setSelectedDocumentId(id: string | null) {
        this.selectedDocumentId = id;
    }

    setSelectedCategoryId(id: string | null) {
        this.selectedCategoryId = id;
    }

    get currentState() {
        return {
            selectedDocumentId: this.selectedDocumentId,
            selectedCategoryId: this.selectedCategoryId,
        };
    }
}

export const navigationStore = new NavigationStore();