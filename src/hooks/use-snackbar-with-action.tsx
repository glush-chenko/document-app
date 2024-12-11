import {BaseVariant, OptionsObject, useSnackbar} from "notistack";
import Button from "@mui/material/Button";

export const useSnackbarWithAction = () => {
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const open = (
        message: string,
        onButtonClick: () => void,
        textButton: string,
        options?: OptionsObject,
        variant?: "default" | "error" | "success" | "warning" | "info"
    ) => {
        const defaultOptions: OptionsObject = {
            variant: variant,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
            },
            autoHideDuration: 3000,
        };

        enqueueSnackbar(message, {
            action: (
                <Button
                    size="small"
                    onClick={onButtonClick}
                    sx={{color: "white"}}
                >
                    {textButton}
                </Button>
            ),
            ...defaultOptions,
            ...options
        })
    }
    return {
        enqueueSnackbar: open,
        closeSnackbar
    }
}