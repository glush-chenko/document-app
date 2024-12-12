import {FileObj} from "../stores/file-manager-store";

const API_BASE_URL = 'https://cloud-api.yandex.net/v1/disk';
const API_RESOURCES_URL = `${API_BASE_URL}/resources`;
const BASE_PATH = 'CaseLabDocuments';
const OAUTH_TOKEN = 'y0_AgAAAABv48hZAADLWwAAAAESE8nHAADpU4SPGP5Pua6oV6rsy_rYe0TFNw';

const API_ENDPOINTS = {
    CREATE_FOLDER: `${API_RESOURCES_URL}?path=`,
    MOVE_DOCUMENT: `${API_RESOURCES_URL}/move`,
    DELETE_DOCUMENT: `${API_RESOURCES_URL}?path=`,
    DOWNLOAD_FILE: `${API_RESOURCES_URL}/download?path=`,
    GET_TRASH_CONTENTS: `${API_BASE_URL}/trash/resources`,
    CLEAR_TRASH: `${API_BASE_URL}/trash/resources`,
    RESTORE_FILE_FROM_TRASH: `${API_BASE_URL}/trash/resources/restore?path=`,
    DELETE_FILE_FROM_TRASH: `${API_BASE_URL}/trash/resources?path=`
};

const getFullPath = (endpoint: string, path: string) => {
    return `${endpoint}${path}`;
};

export const fetchFiles = async (subPath?: string): Promise<FileObj[]> => {
    try {
        const response = await fetch(subPath ? `${getFullPath(API_ENDPOINTS.CREATE_FOLDER, BASE_PATH)}/${subPath}` : getFullPath(API_ENDPOINTS.CREATE_FOLDER, BASE_PATH), {
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка при получении файлов');
        }

        if (!data._embedded || !Array.isArray(data._embedded.items)) {
            console.warn('Нет доступных файлов в категории:', subPath);
            return [];
        }

        return data._embedded.items
            .filter((item: any) => (item.type === 'file' && !!subPath) || item.type === 'dir')
            .map((item: any): FileObj => {
                const xxlSize = item.sizes && item.sizes.find((size: any) => size.name === 'XXL');

                return {
                    id: item.resource_id,
                    name: item.name,
                    preview: item.preview,
                    category: subPath,
                    url: xxlSize ? xxlSize.url : item.file,
                    path: item.path,
                    created: item.created,
                    type: item.type,
                    items: []
                }
            });
    } catch (error) {
        console.error('Ошибка при получении файлов:', error);
        return [];
    }
}

export const createFolder = async (folderPath: string = '/') => {
    try {
        const response = await fetch(getFullPath(API_ENDPOINTS.CREATE_FOLDER, folderPath), {
            method: 'PUT',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Ошибка при создании папки');
        }

        return true;
    } catch (error) {
        console.error('Ошибка при создании папки:', error);
        return false;
    }
};

export const moveDocument = async (sourcePath: string, targetPath: string) => {
    try {
        const response = await fetch(getFullPath(API_ENDPOINTS.MOVE_DOCUMENT, `?from=${sourcePath}&path=${targetPath}`), {
            method: 'POST',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при перемещении документа');
        }

        return true;
    } catch (error) {
        console.error('Ошибка при перемещении документа:', error);
        return false;
    }
};

export const deleteDocument = async (path: string) => {
    try {
        const response = await fetch(getFullPath(`${API_ENDPOINTS.DELETE_DOCUMENT}`, path), {
            method: 'DELETE',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении документа');
        }

        return true;
    } catch (error) {
        console.error('Ошибка при удалении документа:', error);
        return false;
    }
};

export const renameItem = async (currentPath: string, newPath: string) => {
    try {
        const response = await fetch(getFullPath(API_ENDPOINTS.MOVE_DOCUMENT, `?from=${currentPath}&path=${newPath}&force_async=false`), {
            method: 'POST',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при переименовании документа');
        }

        return true;
    } catch (error) {
        console.error('Ошибка при переименовании документа:', error);
        return false;
    }
};

export const downloadFile = async (filePath: string): Promise<string | null> => {
    try {
        const response = await fetch(getFullPath(API_ENDPOINTS.DOWNLOAD_FILE, filePath), {
            method: 'GET',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Ошибка при получении ссылки для скачивания:', error);
            return null;
        }

        const data = await response.json();
        return data.href;
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        return null;
    }
};

export const getTrashContents = async (): Promise<FileObj[]> => {
    try {
        const response = await fetch(API_ENDPOINTS.GET_TRASH_CONTENTS, {
            method: 'GET',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении содержимого корзины');
        }

        const data = await response.json();

        return data._embedded.items
            .filter((item: any) => item.type === 'file' || item.type === 'dir')
            .map((item: any): FileObj => ({
                id: item.resource_id,
                name: item.name,
                preview: item.preview,
                path: item.path,
                created: item.created,
                type: item.type,
                items: []
            }));
    } catch (error) {
        console.error('Ошибка при получении содержимого корзины:', error);
        return [];
    }
};

export const clearTrash = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.CLEAR_TRASH, {
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

export const restoreFileFromTrash = async (filePath: string) => {
    try {
        const response = await fetch(getFullPath(API_ENDPOINTS.RESTORE_FILE_FROM_TRASH, filePath), {
            method: 'PUT',
            headers: {
                Authorization: `OAuth ${OAUTH_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при восстановлении файла');
        }

        console.log('Файл восстановлен');
    } catch (error) {
        console.error('Ошибка при восстановлении файла:', error);
    }
};

export const deleteFileFromTrash = async (filePath: string) => {
    try {
        const response = await fetch(getFullPath(API_ENDPOINTS.DELETE_FILE_FROM_TRASH, filePath), {
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