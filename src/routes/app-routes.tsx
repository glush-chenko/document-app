import {createBrowserRouter, createRoutesFromElements, Navigate, Route} from "react-router-dom";
import {Root} from "../components/root/root";
import {DocumentsList} from "../components/file-manager/document/list/documents-list";
import {navigationStore, VIEW_TYPES} from "../stores/navigation-store";
import React from "react";
import {itemsRoutes} from "./items-routes";

export const appRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Root/>}>
        <Route index element={<Navigate to="CaseLabDocuments" replace/>}/>
        <Route path="CaseLabDocuments">
            <Route index element={<Navigate to="categories" replace/>}/>
            <Route
                path="documents/*"
                element={<DocumentsList/>}
                loader={() => {
                    navigationStore.setCurrentView(VIEW_TYPES.ALL_DOCUMENTS);
                    return null;
                }}
            >
                {itemsRoutes}
            </Route>

            <Route
                path="categories/*"
                element={<DocumentsList/>}
                loader={() => {
                    navigationStore.setCurrentView(VIEW_TYPES.ALL_CATEGORIES);
                    return null;
                }}
            />
        </Route>
        <Route
            path="trash"
            element={<DocumentsList/>}
            loader={() => {
                navigationStore.setCurrentView(VIEW_TYPES.TRASH);
                return null;
            }}
        />
        <Route path="*" element={<Navigate to="/" replace/>}/>
    </Route>
));