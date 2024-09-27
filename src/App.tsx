import React from 'react';
import './App.css';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Navigate,
    Route,
    RouterProvider
} from "react-router-dom";
import {Root} from "./routes/root";
import {HomePage} from "./pages/home/home-page";
import {DocumentList} from "./ components/document/document-list";
import {CategoryList} from "./ components/category/category-list";
import {CategoryDocuments} from "./ components/category/category-documents";
import {DocumentDetail} from "./ components/document/document-detail";
import {DeleteDocument} from "./ components/document/delete-document";
import {MoveDocument} from "./ components/document/move-document";

const appRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Root/>}>
        <Route index element={<HomePage/>}/>
        <Route path="documents" element={<DocumentList/>}/>
        <Route path="categories" element={<CategoryList/>}/>
        <Route path="categories/:categoryId/documents" element={<CategoryDocuments />}/>
        <Route path="documents/:documentId" element={<DocumentDetail />}/>
        <Route path="documents/:documentId/move" element={<MoveDocument />}/>
        <Route path="documents/:documentId/delete" element={<DeleteDocument />}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
    </Route>
));

function App() {
    return (
        <RouterProvider router={appRouter}/>
    );
}

export default App;
