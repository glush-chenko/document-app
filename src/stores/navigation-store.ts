import {makeAutoObservable} from 'mobx';

export enum VIEW_TYPES {
    ALL_DOCUMENTS = "ALL_DOCUMENTS",
    ALL_CATEGORIES = "ALL_CATEGORIES",
}

class NavigationStore {
    currentView = VIEW_TYPES.ALL_CATEGORIES;

    constructor() {
        makeAutoObservable(this);
    }

    setCurrentView(newView: VIEW_TYPES) {
        this.currentView = newView;
    }
}

export const navigationStore = new NavigationStore();
(window as any).navigationStore  = navigationStore;