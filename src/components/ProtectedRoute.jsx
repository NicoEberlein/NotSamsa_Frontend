import {useAuth} from "../contexts/AuthContext.jsx";
import {Navigate, Outlet} from "react-router-dom";
import {useEffect} from "react";
import log from "loglevel";

export const ProtectedRoute = () => {

    useEffect(() => {
        log.info("Mounted ProtectedRoute")

        return () => {
            log.info("Unmounted ProtectedRoute")
        }
    }, [])

    const { isAuthenticated, isAuthLoading} = useAuth()

    if (isAuthLoading) {
        return null
    }

    if(!isAuthenticated){
        return <Navigate to={"/login"}/>
    }

    return <Outlet/>

}