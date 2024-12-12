import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import {useCallback} from "react";
import {useFetchAllDocuments} from "../../hooks/use-fetch-all-documents";
import {FileObj} from "../../stores/file-manager-store";
import {observer} from "mobx-react-lite";
import {useNavigate} from "react-router-dom";
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import {useTrimmedPath} from "../../hooks/use-trimmed-path";
import {ObservableMap} from "mobx";

export const AsynchronousAutocomplete = observer(() => {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState<FileObj[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [documents, setDocuments] = React.useState<never[] | ObservableMap<string, FileObj[]>>([]);

    const navigate = useNavigate();
    const getTrimmedResult = useTrimmedPath();
    const fetchAllDocuments = useFetchAllDocuments();

    const handleOpen = useCallback(async () => {
        setOpen(true);
        setLoading(true);

        const allDocuments = await fetchAllDocuments();
        setDocuments(allDocuments);

        setLoading(false);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setOptions([]);
    }, []);

    const handleInputChange = useCallback((event: React.SyntheticEvent, value: string) => {
        if (value.trim() === '') {
            setOptions([]);
            return;
        }

        const filteredOptions = Array.from(documents.values()).flat().filter(doc =>
          doc.name.toLowerCase().startsWith(value.toLowerCase())
        );
        setOptions(filteredOptions);
    }, [documents]);

    const handleOptionClick = useCallback((option: FileObj) => {
        if (option.type === "file") {
            navigate(`?id=${option.id}`);
        } else {
            const trimmedResult = getTrimmedResult("disk:/CaseLabDocuments/", option.path);

            if (trimmedResult) {
                navigate(`/CaseLabDocuments/categories/${trimmedResult}`);
            }
        }
        handleClose();
    }, [navigate, getTrimmedResult]);

    return (
        <Autocomplete
            className="autocomplete"
            sx={{width: 300, backgroundColor: "white"}}
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            onInputChange={handleInputChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    label="Поиск по документам"
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="primary" size="20px"/> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        },
                    }}
                />
            )}
            renderOption={(props, option) => (
                <ListItem {...props} key={option.id} onClick={() => handleOptionClick(option)}>
                    <ListItemIcon>
                        {option.type === 'file' ? <DescriptionIcon/> : <FolderIcon/>}
                    </ListItemIcon>
                    {option.name}
                </ListItem>
            )}
        />
    );
});