import React, {useCallback, useEffect, useMemo} from "react";
import {Outlet, useParams} from "react-router-dom";
import "./document-detail-style.scss";
import {fileManagerStore} from "../../../../stores/file-manager-store";
import {observer} from "mobx-react-lite";
import {SliderToolbar} from "./slider-toolbar/slider-toolbar";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";
import {Loading} from "../../../generic/loading";

interface DocumentDetailProps {
    docId: string;
}

export const DocumentDetail = observer((props: DocumentDetailProps) => {
    const {'*': path} = useParams();
    const {docId} = props;

    const loading = fileManagerStore.loading;

    const filteredDocuments = useMemo(() => {
        if (path) {
            return fileManagerStore.getFilesByPath(path)
        } else {
            return fileManagerStore.getAllDocuments();
        }
    }, []);

    const getDocumentIndex = useCallback(() => {
        return fileManagerStore.getFileIndexById(path || "/", docId);
    }, [docId, path]);

    const [currentDocIndex, setCurrentDocIndex] = React.useState(getDocumentIndex());
    const [infoPopupAnchor, setInfoPopupAnchor] = React.useState<null | HTMLElement>(null);
    const [buttonsVisible, setButtonsVisible] = React.useState(true);

    useEffect(() => {
        const index = getDocumentIndex();

        if (index !== -1) {
            setCurrentDocIndex(index);
        }
    }, []);

    const selectedFiles = useMemo(() => {
        if (path) {
            return fileManagerStore.getFileById(path, docId)
        } else {
            return fileManagerStore.findFileById(docId)
        }
    }, [path, docId])

    const handleClickAway = useCallback(() => {
        setButtonsVisible(prev => !prev);
        setInfoPopupAnchor(null);
    }, []);

    return (
        <>
            <div className="document-detail modal">
                {loading ? (
                    <Loading/>
                ) : (
                    <>
                        {selectedFiles ? (
                            <div>
                                <img
                                    src={selectedFiles.url}
                                    alt={selectedFiles.name}
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
                        files={filteredDocuments}
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