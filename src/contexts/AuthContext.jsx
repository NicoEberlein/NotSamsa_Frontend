import {createContext, useContext, useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import performRequest from "../performRequest.js";

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)

    const getToken = () => {
        return localStorage.getItem("token")
    }

    const {
        data: userData,
        error: userError,
        isLoading: isUserQueryLoading,
        isError: isUserQueryError,
        isSuccess: isUserQuerySuccess,
    } = useQuery({
        queryKey: ["user"],
        queryFn: async ({ signal }) => {
            return performRequest({
                url: "http://localhost:8080/users/me",
                method: "GET",
                appendAuthorization: true,
                signal: signal,
            });
        },
        enabled: !!getToken(),
        staleTime: Infinity,
        retry: (failureCount, error) => {
            console.dir(error)
            if (error.status === 401 || error.status === 403 || error.status === 404) {
                return false
            }
            return failureCount < 3
        }
    })

    useEffect(() => {
        if(!isUserQueryLoading) {
            setIsAuthLoading(false)
        }

        if(isUserQuerySuccess && userData) {
            setIsAuthenticated(true)
            setUser(userData)
        }else if(isUserQueryError) {
            setIsAuthenticated(false)
            setUser(null)
            localStorage.removeItem("token")
        }
    }, [isUserQueryLoading, isUserQuerySuccess, isUserQueryError, userData, userError]);

    const authValue = {
        isAuthenticated,
        user,
        isAuthLoading
    }

    return (
        <AuthContext.Provider value={authValue}>
            {isAuthLoading ? <h1>Loading</h1> : children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if(context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}