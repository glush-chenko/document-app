import {fileManagerStore} from "../stores/file-manager-store";
import {fetchCategories, fetchDocuments} from "../services/yandex-disk-api";
import {Document} from "../types/document";

export const fetchAllDocuments = async (): Promise<Document[]> => {
    let categories = fileManagerStore.categories;

    if (!categories || categories.length === 0) {
        categories = await fetchCategories();
        fileManagerStore.setCategories(categories);
    }

    const documentPromises = categories.map(category => fetchDocuments(category.name));

    try {
        const documentsArray = await Promise.all(documentPromises);
        return documentsArray.flat();
    } catch (error) {
        console.error('Ошибка при получении документов:', error);
        return [];
    }
};