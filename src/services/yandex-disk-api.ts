import {Document} from "../types/document";
import {Category} from "../types/category";
import {Folder} from "../types/folder";
import {fileManagerStore} from "../stores/file-manager-store";

const BASE_URL = 'https://cloud-api.yandex.net/v1/disk/resources?path=CaseLabDocuments';
const OAUTH_TOKEN = 'y0_AgAAAABv48hZAADLWwAAAAESE8nHAADpU4SPGP5Pua6oV6rsy_rYe0TFNw';

export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const response = await fetch(`${BASE_URL}`, {
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка при получении категорий');
        }

        return data._embedded.items.map((item: any) => ({
            name: item.name,
            id: item.resource_id,
            type: item.type
        }));
    } catch (error) {
        console.error('Ошибка при получении категории:', error);
        return [];
    }
};

export const fetchDocuments = async (category: string): Promise<Document[]> => {
    try {
        const response = await fetch(`${BASE_URL}/${category}`, {
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка при получении документов');
        }

        return data._embedded.items
            .filter((item: any) => item.type === 'file')
            .map((item: any)=> {
                const xxlSize = item.sizes.find((size: any) => size.name === 'XXL');

                return {
                    id: item.resource_id,
                    name: item.name,
                    category,
                    preview: item.preview,
                    url: xxlSize ? xxlSize.url : item.file,
                    path: item.path,
                    created: item.created,
                    type: item.type
                }
            });
    } catch (error) {
        console.error('Ошибка при получении документов:', error);
        return [];
    }
};

export const moveDocument = async (sourcePath: string, targetPath: string): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/move?from=${encodeURIComponent(sourcePath)}&path=${encodeURIComponent(targetPath)}/new_file`, {
            method: 'POST',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при перемещении документа');
        }
    } catch (error) {
        console.error('Ошибка при перемещении документа:', error);
    }
};

export const deleteDocument = async (path: string): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/${encodeURIComponent(path)}`, {
            method: 'DELETE',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении документа');
        }
    } catch (error) {
        console.error('Ошибка при удалении документа:', error);
    }
};

export const renameItem = async (oldPath: string, newPath: string) => {
    const url = `https://cloud-api.yandex.net/v1/disk/resources/move?from=${encodeURIComponent(oldPath)}&path=${encodeURIComponent(newPath)}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `OAuth ${OAUTH_TOKEN}`,
        },
    });

    if (response.ok) {
        console.log('Файл или папка успешно переименованы!');
    } else {
        const error = await response.json();
        console.error('Ошибка:', error);
    }
};

export const getTrashContents = async (): Promise<void> => {
    try {
        const response = await fetch(`https://cloud-api.yandex.net/v1/disk/trash/resources`, {
            method: 'GET',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении содержимого корзины');
        }

        const data = await response.json();

        const trashItems = data._embedded.items.map((item: any) => {
            if (item.type === 'file') {
                return {
                    id: item.resource_id,
                    name: item.name,
                    preview: item.preview,
                    path: item.path,
                    created: item.created
                } as Document;
            } else if (item.type === 'dir') {
                return {
                    public_key: item.public_key,
                    name: item.name,
                    type: 'dir',
                    created: item.created,
                    modified: item.modified,
                    path: item.path,
                } as Folder;
            }
            return null;
        }).filter((item: any) => item !== null);

        fileManagerStore.setTrashItems(trashItems);
    } catch (error) {
        console.error('Ошибка при получении содержимого корзины:', error);
    }
};

export const clearTrash = async (): Promise<void> => {
    try {
        const response = await fetch(`https://cloud-api.yandex.net/v1/disk/trash/resources`, {
            method: 'DELETE',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при очистке корзины');
        }

        console.log('Корзина очищена');
    } catch (error) {
        console.error('Ошибка при очистке корзины:', error);
    }
};

export const restoreFileFromTrash = async (path: string): Promise<void> => {
    try {
        const response = await fetch(`https://cloud-api.yandex.net/v1/disk/trash/resources/restore`, {
            method: 'PUT',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: path }),
        });

        if (!response.ok) {
            throw new Error('Ошибка при восстановлении файла');
        }

        console.log('Файл восстановлен');
    } catch (error) {
        console.error('Ошибка при восстановлении файла:', error);
    }
};

export const deleteFileFromTrash = async (path: string): Promise<void> => {
    try {
        const response = await fetch(`https://cloud-api.yandex.net/v1/disk/trash/resources?path=${encodeURIComponent(path)}`, {
            method: 'DELETE',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении файла из корзины');
        }

        console.log('Файл удалён из корзины');
    } catch (error) {
        console.error('Ошибка при удалении файла из корзины:', error);
    }
};