import {fileManagerStore, FileObj} from "../stores/file-manager-store";
import {fetchFiles} from "../services/yandex-disk-api";
import {Document} from "../types/document";
import {useFetchDocumentsFromDirectory} from "./use-fetch-documents-from-directory";
import {useTrimmedPath} from "./use-trimmed-path";
import {observable} from "mobx";

interface PromiseResult {
    path: string;
    response: FileObj[];
}

export const useFetchAllDocuments = () => {
    const getTrimmedResultFromCustomPath = useTrimmedPath();
    const fetchDocumentsFromDirectory = useFetchDocumentsFromDirectory();

    return async () => {
        const allFiles = observable.map<string, FileObj[]>();
        const categories = await fetchFiles();
        allFiles.set("/", categories);

        const documentPromises: Promise<PromiseResult>[] = categories
            .filter((category) => category.type === "dir")
            .map((category) => {
            return fetchFiles(category.name).then((res) => {
                return {
                    path: category.name,
                    response: res
                }
            })
        });

        try {
            const promisesResult = await Promise.all(documentPromises);

            for (const result of promisesResult) {
                allFiles.set(result.path, result.response);

                for (const file of result.response) {
                    if (file.type === "dir") {
                        const trimmedResultFromCustomPath = getTrimmedResultFromCustomPath("disk:/CaseLabDocuments/", file.path);

                        const subDocuments = await fetchDocumentsFromDirectory(trimmedResultFromCustomPath);
                        allFiles.merge(subDocuments);
                    }
                }
            }

            return allFiles;
        } catch (error) {
            console.error('Ошибка при получении документов:', error);
            return [];
        }
    }
};