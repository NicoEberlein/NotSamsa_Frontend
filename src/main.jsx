import {lazy, StrictMode} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19';
import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AuthProvider} from "./contexts/AuthContext.jsx";
import {ProtectedRoute} from "./components/ProtectedRoute.jsx";
const LazyApp = lazy(() => import('./App.jsx'));
const LazyLoginPage = lazy(() => import('./components/login.jsx'));
const LazyRegisterPage = lazy(() => import('./components/register.jsx'));
const LazyCollectionsView = lazy(() => import('./components/CollectionsView.jsx'));
const LazyCollectionDetailView = lazy(() => import('./components/CollectionDetailView.jsx'));
import {ConfigProvider, theme} from "antd";
import {ThemeProvider, useTheme} from "./contexts/ThemeContext.jsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        element: <ProtectedRoute/>,
        children: [
            {
                path: "/",
                element: <LazyApp/>
            },
            {
                path: "/collections",
                element: <LazyCollectionsView/>
            },
            {
                path: "/collections/:collectionId",
                element: <LazyCollectionDetailView/>
            }
        ]
    },
    {
        path: "/login",
        element: <LazyLoginPage/>,
    },
    {
        path: "/register",
        element: <LazyRegisterPage/>
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
