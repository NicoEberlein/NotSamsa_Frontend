import {useAuth} from "../contexts/AuthContext.jsx";
import {Navigate, Outlet} from "react-router-dom";

export const ProtectedRoute = () => {

    const { isAuthenticated, isAuthLoading} = useAuth()

    if (isAuthLoading) {
        return null
    }

    if(!isAuthenticated){
        return <Navigate to={"/login"}/>
    }

    return <Outlet/>

}