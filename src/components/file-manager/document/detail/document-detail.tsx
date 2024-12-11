import React, {useCallback, useEffect, useMemo} from "react";
import {Outlet, useLocation} from "react-router-dom";
import "./document-detail-style.scss";
import {fileManagerStore} from "../../../../stores/file-manager-store";
import {observer} from "mobx-react-lite";
import {SliderToolbar} from "./slider-toolbar/slider-toolbar";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";
import {Loading} from "../../../generic/loading";
import {Document} from "../../../../types/document";

interface DocumentDetailProps {
    docId: string;
}
export const DocumentDetail = observer((props: DocumentDetailProps) => {
    const {docId} = props;
    const location = useLocation();

    const documents = fileManagerStore.documents;
    const loading = fileManagerStore.loading;

    const filteredDocuments = useMemo(() => {
        return documents.filter(document => document.type === "file") as Document[];
    }, [documents]);

    const getDocumentIndex = useCallback(() => {
        // const fullPath = location.pathname;
        // const lastIndex = fullPath.lastIndexOf("/");
        // const newPath = fullPath.slice(lastIndex + 1);
        return filteredDocuments.findIndex(doc => {
            return doc.id === docId;
        });
    }, [filteredDocuments, docId]);

    const [currentDocIndex, setCurrentDocIndex] = React.useState(getDocumentIndex());
    const [infoPopupAnchor, setInfoPopupAnchor] = React.useState<null | HTMLElement>(null);
    const [buttonsVisible, setButtonsVisible] = React.useState(true);

    useEffect(() => {
        const index = getDocumentIndex();

        if (index !== -1) {
            setCurrentDocIndex(index);
        }
    }, [filteredDocuments]);

    const selectedDocument = filteredDocuments[currentDocIndex] as Document;

    const handleClickAway = useCallback(() => {
        setButtonsVisible(prev => !prev);
        setInfoPopupAnchor(null);
    }, []);

    return (
        <>
            <div className="document-detail modal">
                {loading ? (
                    <Loading />
                ) : (
                    <>
                        {selectedDocument ? (
                            <div>
                                <img
                                    src={selectedDocument.url}
                                    alt={selectedDocument.name}
                                    className="full-document-image"
                                />
                            </div>

                        ) : (
                            <p>Документ не найден.</p>
                        )}
                    </>
                )}

                <ClickAwayListener onClickAway={handleClickAway}>
                    <SliderToolbar
                        currentDocIndex={currentDocIndex}
                        setCurrentDocIndex={setCurrentDocIndex}
                        documents={filteredDocuments}
                        buttonsVisible={buttonsVisible}
                        infoPopupAnchor={infoPopupAnchor}
                        setInfoPopupAnchor={setInfoPopupAnchor}
                    />
                </ClickAwayListener>

                <Outlet/>
            </div>
        </>
    )
});