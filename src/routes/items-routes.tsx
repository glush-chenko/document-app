import {Route} from "react-router-dom";
import {DocumentDetail} from "../components/file-manager/document/detail/document-detail";
import {MoveDocumentModal} from "../components/file-manager/document/move/move-document-modal";
import {RenameDocuments} from "../components/file-manager/document/rename/rename-documents";
import React from "react";

export const itemsRoutes = [
    // <Route path=":documentId" element={<DocumentDetail/>} key="document-details">
    //     <Route path="move" element={<MoveDocumentModal/>} key="move-document-details"/>,
    //     <Route path="rename" element={<RenameDocuments/>} key="rename-document-details"/>
    // </Route>,
    // <Route
    //     path="move"
    //     element={<MoveDocumentModal />}
    //     key="move-inside-category-details"
    // />,
    // <Route path="rename" element={<RenameDocuments/>} key="rename-inside-category-details"/>,
];

export const categoryRoutes = [
    // <Route path="move" element={<MoveDocumentModal/>} key="move-category-details"/>,
    // <Route path="rename" element={<RenameDocuments/>} key="rename-category-details"/>,
];