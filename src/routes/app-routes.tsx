import {createBrowserRouter, createRoutesFromElements, Navigate, Route} from "react-router-dom";
import {Root} from "../components/root/root";
import {DocumentsList} from "../components/file-manager/document/list/documents-list";
import {fetchAllDocuments} from "../hooks/fetch-all-documents";
import {fileManagerStore} from "../stores/file-manager-store";
import {navigationStore, VIEW_TYPES} from "../stores/navigation-store";
import {CategoryList} from "../components/file-manager/category/list/category-list";
import {fetchCategories, fetchDocuments} from "../services/yandex-disk-api";
import {TrashList} from "../components/file-manager/trash-list/trash-list";
import React from "react";
import {categoryRoutes, itemsRoutes} from "./items-routes";

export const appRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Root/>}>
        <Route index element={<Navigate to="CaseLabDocuments" replace/>}/>
        <Route path="CaseLabDocuments">
            <Route index element={<Navigate to="categories" replace/>}/>
            <Route
                path="documents"
                element={<DocumentsList showActionsMenu={false} showBackButton={false}/>}
                loader={async () => {
                    try {
                        const docs = await fetchAllDocuments();
                        fileManagerStore.setDocuments(docs);
                        navigationStore.setCurrentView(VIEW_TYPES.ALL_DOCUMENTS);
                    } catch (error) {
                        console.error('Ошибка при загрузке документов:', error);
                    }
                    return false;
                }}
            >
                {itemsRoutes}
            </Route>
            <Route
                path="categories"
                element={<CategoryList/>}
                loader={async () => {
                    try {
                        const fetchedCategories = await fetchCategories();
                        fileManagerStore.setCategories(fetchedCategories);
                    } catch (error) {
                        console.error('Ошибка при загрузке категорий:', error);
                    }
                    return false;
                }}
            >
                {categoryRoutes}
            </Route>

            <Route path="categories/:categoryName" element={<DocumentsList />} loader={async ({ params }) => {
                if (!params.categoryName) return true;

                try {
                    const documents = await fetchDocuments(params.categoryName);
                    navigationStore.setCurrentView(VIEW_TYPES.ALL_CATEGORIES);
                    fileManagerStore.setDocuments(documents);
                    fileManagerStore.setCurrentCategory(params.categoryName);
                } catch (error) {
                    console.error('Ошибка при загрузке документов:', error);
                }

                return false;
            }} >
                {itemsRoutes}
            </Route>
        </Route>
        <Route path="trash" element={<TrashList/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
    </Route>
));