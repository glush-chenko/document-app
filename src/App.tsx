import React from 'react';
import './App.css';
import {RouterProvider} from "react-router-dom";
import {appRouter} from "./routes/app-routes";
import {SnackbarProvider} from 'notistack';

function App() {
    return (
        <SnackbarProvider maxSnack={2}>
            <RouterProvider router={appRouter}/>
        </SnackbarProvider>
    );
}

export default App;
