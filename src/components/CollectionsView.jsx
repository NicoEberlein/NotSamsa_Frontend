import React, { useState } from 'react';
import {
    Layout,
    Row,
    Col,
    Typography,
    Button,
    Spin,
    Alert,
    Modal,
    Grid, notification
} from 'antd';
import {LogoutOutlined, PlusOutlined} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreateModifyCollectionModal from './CreateModifyCollectionModal.jsx';
import CollectionCard from '../components/CollectionCard';
import performRequest from "../performRequest.js";
import {useNavigate} from "react-router-dom";
import PageFooter from "./PageFooter.jsx";
import {useTheme} from "../contexts/ThemeContext.jsx";


const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CollectionsView = () => {

    const { toggleTheme, darkMode } = useTheme();

    const [currentPage, setCurrentPage] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const navigate = useNavigate();

    const screens = useBreakpoint();

    const queryClient = useQueryClient();

    const {
        data: data,
        isLoading: isLoadingCollections,
        isError: isErrorCollections,
        error: collectionsError,
    } = useQuery({
        queryKey: ['collections', currentPage],
        queryFn: async ({ signal }) => {
            return performRequest({
                url: `http://localhost:8080/collections?page=${currentPage}`,
                method: "GET",
                appendAuthorization: true,
                signal: signal,
            })
        },
    });

    const handleShowModal = (modalFn) => {
        return () => {modalFn(true)};
    };

    const handleCloseModal = (modalFn) => {
        return () => {modalFn(false)};
    };

    const handleCollectionCreated = () => {
        queryClient.invalidateQueries({ queryKey: ['userCollections'] });
        handleCloseModal(setIsModalVisible);
        notification.success({
            message: "Created",
            description: "Collection was created successfully",
        })
    };

    const handleErrorCollectionCreated = () => {
        handleCloseModal(setIsModalVisible);
        notification.error({
            message: "Error",
            description: "An error occurred whilst creating collection",
        })
    }

    const getGridCols = () => {
        if (screens.xxl) return 4;
        if (screens.xl) return 3;
        if (screens.lg) return 3;
        if (screens.md) return 2;
        if (screens.sm) return 1;
        return 1;
    };


    return (
        <Layout style={{ minHeight: '100vh' }}>

            <Content style={{ padding: '24px', backgroundColor: darkMode ? '#333333':'#f0f2f5' }}>

                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Your Collections</Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            shape="circle"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleShowModal(setIsModalVisible)}
                            title="Create new collection"
                        />
                    </Col>
                    <Col>
                        <Button onClick={() => {
                            toggleTheme()
                        }}>{ darkMode ? "Light" : "Dark"}</Button>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                        shape="circle"
                        size="large"
                        icon={<LogoutOutlined/>}
                        onClick={() => {
                            localStorage.removeItem("token")
                            localStorage.removeItem("user")
                            navigate("/login")
                        }}>
                        </Button>
                    </Col>
                </Row>

                {isLoadingCollections && (
                    <div style={{ textAlign: 'center', marginTop: 50 }}>
                        <Spin size="large" tip="Loading..." />
                    </div>
                )}

                {isErrorCollections && (
                    <Alert
                        message="Fehler beim Laden der Collections"
                        description={collectionsError?.message || "Ein unbekannter Fehler ist aufgetreten."}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                {!isLoadingCollections && !isErrorCollections && (
                    <Row gutter={[24, 24]} justify={data.items?.length > 0 ? 'start' : 'center'}>
                        {data.items?.length > 0 ? (
                            data.items.map((collection) => (
                                <Col key={collection.id} xs={24} sm={getGridCols() > 1 ? 12 : 24} md={24 / getGridCols()} lg={24 / getGridCols()} xl={24 / getGridCols()} xxl={24 / getGridCols()}>
                                    <CollectionCard collection={collection} />
                                </Col>
                            ))
                        ) : (
                            <Col style={{ textAlign: 'center', width: '100%' }}>
                                <Title level={4}>No collections</Title>
                                <Text>Create a new one using the "+"-Button</Text>
                            </Col>
                        )}
                    </Row>
                )}
                { !isLoadingCollections && !isErrorCollections && data.pageDetails.totalPages > 1 && <PageFooter pages={data.pageDetails.totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}></PageFooter>}
            </Content>

            <Modal
                title="Create new collection"
                visible={isModalVisible}
                onCancel={handleCloseModal(setIsModalVisible)}
                footer={null}
                destroyOnClose={true}
                width={600}
            >
                <CreateModifyCollectionModal
                    onClose={handleCloseModal(setIsModalVisible)}
                    onSuccess={handleCollectionCreated}
                    onError={handleErrorCollectionCreated}
                />
            </Modal>

        </Layout>
    );

};

export default CollectionsView;