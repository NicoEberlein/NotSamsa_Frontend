import {createContext, useContext, useState} from "react";
import log from "loglevel";

const ThemeContext = createContext("dark");

export const useTheme = () => {
    return useContext(ThemeContext)
}

export const ThemeProvider = ({children}) => {

    let savedTheme

    if(localStorage.getItem("theme") === "dark") {
        savedTheme = true
    }else{
        savedTheme = false
    }

    const [darkMode, setDarkMode] = useState(savedTheme);

    const toggleTheme = () => {
        log.info("Toggle dark mode to ", !darkMode)
        localStorage.setItem("theme", darkMode ? "light" : "dark");
        setDarkMode((mode) => !mode)
    }

    return (
        <ThemeContext.Provider value={{ toggleTheme, darkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}