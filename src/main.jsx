import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19';
import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import LoginPage from "./components/login.jsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import RegisterPage from "./components/register.jsx";
import {AuthProvider} from "./contexts/AuthContext.jsx";
import {ProtectedRoute} from "./components/ProtectedRoute.jsx";
import CollectionsView from "./components/CollectionsView.jsx";
import CollectionDetailView from "./components/CollectionDetailView.jsx";
import {ThemeProvider, useTheme} from "./contexts/ThemeContext.jsx";
import {ConfigProvider, theme} from "antd";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        element: <ProtectedRoute/>,
        children: [
            {
                path: "/",
                element: <App/>
            },
            {
                path: "/collections",
                element: <CollectionsView/>
            },
            {
                path: "/collections/:collectionId",
                element: <CollectionDetailView/>
            }
        ]
    },
    {
        path: "/login",
        element: <LoginPage/>,
    },
    {
        path: "/register",
        element: <RegisterPage/>
    }
])

const AppContent = () => {
    const { darkMode } = useTheme();
    return <ConfigProvider theme={{algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm}}>
        <RouterProvider router={router}></RouterProvider>
    </ConfigProvider>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
          <AuthProvider>
              <ThemeProvider>
                  <AppContent />
              </ThemeProvider>
          </AuthProvider>
      </QueryClientProvider>
  </StrictMode>
)
