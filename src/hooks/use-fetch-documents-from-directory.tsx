import {fetchFiles} from "../services/yandex-disk-api";
import {Document} from "../types/document";
import {useTrimmedPath} from "./use-trimmed-path";
import {fileManagerStore, FileObj} from "../stores/file-manager-store";
import {observable} from "mobx";

export const useFetchDocumentsFromDirectory = () => {
    const getTrimmedResultFromCustomPath = useTrimmedPath();

    const fetchDocumentsFromDirectory = async (directoryPath: string) => {
        const documents: FileObj[] = await fetchFiles(directoryPath);

        let allDocuments = observable.map<string, FileObj[]>();
        allDocuments.set(directoryPath, documents);

        for (const item of documents) {
            if (item.type === "dir") {
                const trimmedResultFromCustomPath = getTrimmedResultFromCustomPath("disk:/CaseLabDocuments/", item.path);

                const subDocuments = await fetchDocumentsFromDirectory(trimmedResultFromCustomPath);
                allDocuments.merge(subDocuments);
            }
        }

        return allDocuments;
    }

    return fetchDocumentsFromDirectory;
};