import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {
    Layout,
    Row,
    Col,
    Typography,
    Space,
    Spin,
    Alert,
    List,
    Card,
    Image,
    Button, Modal, message,
} from 'antd';
import {
    ArrowLeftOutlined,
    CompassOutlined, DeleteOutlined, DownloadOutlined,
    PictureOutlined, PlusOutlined, UploadOutlined,
    UserOutlined
} from '@ant-design/icons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import performRequest from "../performRequest.js";
import UploadImageModal from "./UploadImageModal.jsx";
import AddParticipantModal from "./AddParticipantModal.jsx";
import PageFooter from "./PageFooter.jsx";
import log from "loglevel";

const { Content } = Layout;
const { Title, Text } = Typography;

const CollectionDetailView = () => {

    useEffect(() => {
        log.info("Mounted CollectionDetailView");

        return () => {
            log.info("Unmounted CollectionDetailView");
        }
    }, [])

    const { darkMode } = useTheme();

    const { collectionId } = useParams();

    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [isParticipantModalVisible, setIsParticipantModalVisible] = useState(false);

    const [currentParticipantsPage, setCurrentParticipantsPage] = useState(1);
    const [currentImagesPage, setCurrentImagesPage] = useState(1);

    const queryClient = useQueryClient();

    const closeModal = (closeFn) => {
        return () => {
            closeFn(false)
        }
    }


    const downloadMutation = useMutation({
        mutationFn: async ({imageId, collectionId}) => {
            return performRequest({
                url: `http://localhost:8080/collections/${collectionId}/images/${imageId}`,
                method: 'GET',
                appendAuthorization: true,
                parseResponse: "blob"
            })
        },
        onSuccess: ({blob, fileName: serverFileName}) => {
            const finalFileName = serverFileName;
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a")
            a.href = objectUrl;
            a.download = finalFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
        },
        onError: err => {
            console.log(err)
        }
    })

    const deleteParticipantMutation = useMutation({
        mutationFn: async ({collectionId, participantId}) => {
            return performRequest({
                url: `http://localhost:8080/collections/${collectionId}/participants/${participantId}`,
                method: "DELETE",
                appendAuthorization: true,
                parseResponse: "text"
            })
        },
        onSuccess: () => {
            message.success("Participant deleted successfully")
            queryClient.invalidateQueries({
                queryKey: ['collection', collectionId, 'participants']
            })
        },
        onError: (error) => {
            message.error(error)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async ({imageId, collectionId}) => {
            return performRequest({
                url: `http://localhost:8080/collections/${collectionId}/images/${imageId}`,
                method: 'DELETE',
                appendAuthorization: true,
                parseResponse: "text"
            })
        },
        onSuccess: () => {
            console.log("Successfully deleting")
            message.success('Image deleted successfully.');
            queryClient.invalidateQueries({
                queryKey: ['collection', collectionId, 'images'],
            })
        },
        onError: err => {
            console.log(err)
        }
    })

    const setAsPreviewImageMutation = useMutation({
        mutationFn: async ({imageId, collectionId}) => {
            return performRequest({
                url: `http://localhost:8080/collections/${collectionId}`,
                method: 'PATCH',
                appendAuthorization: true,
                body: {
                    previewImageId: imageId
                },
                parseResponse: "text"
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['collections']
            })
            message.success('Preview image changed successfully.')
        },
        onError: (error) => {
            console.log(error)
        },
    })

    const {
        data: collection,
        isLoading: isLoadingCollection,
        isError: isErrorCollection,
        error: collectionError,
    } = useQuery({
        queryKey: ['collection', collectionId],
        queryFn: async () => {
            return performRequest({
                url: `http://localhost:8080/collections/${collectionId}`,
                method: "GET",
                appendAuthorization: true,
            })
        },
        enabled: !!collectionId, // Only enable query if ID exists
        staleTime: 1000 * 60 * 5,
    });

    // Fetch collection images
    const {
        data: images,
        isLoading: isLoadingImages,
        isError: isErrorImages,
        error: imagesError,
    } = useQuery({
        queryKey: ['collection', collectionId, 'images', currentImagesPage],
        queryFn: async () => {
            return performRequest({
                url: `http://localhost:8080/collections/${collectionId}/images?page=${currentImagesPage}`,
                method: "GET",
                appendAuthorization: true,
            })
        },
        enabled: !!collectionId,
        staleTime: 1000 * 60,
    });

    const {
        data: participants,
        isLoading: isLoadingParticipants,
        isError: isErrorParticipants,
        error: participantsError,
    } = useQuery({
        queryKey: ['collection', collectionId, 'participants', currentParticipantsPage],
        queryFn: async () => {
            return performRequest({
                url: `http://localhost:8080/collections/${collectionId}/participants?page=${currentParticipantsPage}`,
                method: "GET",
                appendAuthorization: true,
            })
        },
        enabled: !!collectionId,
        staleTime: 1000 * 60 * 10,
    });

    const isOverallLoading = isLoadingCollection || isLoadingImages || isLoadingParticipants;
    const isOverallError = isErrorCollection || isErrorImages || isErrorParticipants;

    if (isOverallLoading) {
        return (
            <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Loading collection details..." />
            </Layout>
        );
    }

    if (isOverallError) {
        return (
            <Layout style={{ minHeight: '100vh', padding: '24px' }}>
                <Alert
                    message="Error loading collection"
                    description={collectionError?.message || imagesError?.message || participantsError?.message || "An unknown error occurred."}
                    type="error"
                    showIcon
                />
            </Layout>
        );
    }

    if (!collection) {
        return (
            <Layout style={{ minHeight: '100vh', padding: '24px' }}>
                <Alert
                    message="Collection not found"
                    description="The requested collection could not be loaded."
                    type="warning"
                    showIcon
                />
            </Layout>
        );
    }


    return <>
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <Content style={{ padding: '24px' }}>

                {/* Header Section */}
                <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
                    <Link to="/collections"><ArrowLeftOutlined/> Back to collections</Link>
                    <Title level={2} style={{ margin: 0 }}>{collection.name || 'Collection Details'}</Title>
                    <Text type="secondary">{collection.description || 'No description available.'}</Text>
                    <Row gutter={[16, 16]}>
                        <Col>
                            <Text><CompassOutlined /> **Coordinates:** {collection.latitude}, {collection.longitude}</Text>
                        </Col>
                        <Col>
                            <Text><PictureOutlined /> **Images:** {images.pageDetails.totalItems}</Text>
                        </Col>
                        <Col>
                            <Text><UserOutlined /> **Participants:** {participants.pageDetails.totalItems}</Text>
                        </Col>
                    </Row>
                </Space>

                {/* Two-Column Section */}
                <Row gutter={[24, 24]}>
                    {/* Left Column: Images */}
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <Row justify="space-between" align="middle">
                                    <Col><Text strong>Images</Text></Col> {/* Title text */}
                                    <Col>
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            onClick={() => {
                                                setIsUploadModalVisible(true)
                                            }}
                                            size="small"
                                            title="Add Image"
                                        />
                                    </Col>
                                </Row>
                            }
                        >

                            {images && images.items.length > 0 ? (
                                <List
                                    footer={<PageFooter
                                        pages={images.pageDetails.totalPages}
                                        currentPage={currentImagesPage}
                                        setCurrentPage={setCurrentImagesPage}>
                                    </PageFooter>}
                                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                                    dataSource={images.items}
                                    renderItem={item => (
                                        <List.Item key={item.id || item.url}>
                                            <Card
                                                hoverable
                                                cover={<Image alt={item.name || 'Image'} src={item.previewUrl} style={{ height: 150, objectFit: 'cover' }} />}
                                            >
                                                <Button icon={<DownloadOutlined/>}
                                                onClick={() => {
                                                    downloadMutation.mutate({imageId: item["_id"], collectionId: collectionId})
                                                }}>Download</Button>
                                                <Button
                                                    icon={<DeleteOutlined/>}
                                                onClick={() => {
                                                    deleteMutation.mutate({imageId: item["_id"], collectionId: collectionId})
                                                }}>Delete</Button>
                                                { collection.owner && <Button
                                                    onClick={() => {
                                                        setAsPreviewImageMutation.mutate({imageId: item["_id"], collectionId: collectionId})
                                                    }}
                                                    icon={<UploadOutlined/>}>
                                                    Set as preview image
                                                </Button>}
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                !isLoadingImages && <Text>No images found for this collection.</Text>
                            )}
                        </Card>
                    </Col>


                    {/* Right Column: Participants */}
                    <Col xs={24} lg={8}>
                        <Card
                            title={
                                <Row justify="space-between" align="middle">
                                    <Col><Text strong>Participants</Text></Col> {/* Title text */}
                                    <Col>
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            onClick={() => {
                                                setIsParticipantModalVisible(true)
                                            }}
                                            size="small"
                                            title="Add Participant"
                                        />
                                    </Col>
                                </Row>
                            }
                        >
                            {participants && participants.items.length > 0 ? (
                                <List
                                    footer={<PageFooter
                                        pages={participants.pageDetails.totalPages}
                                        currentPage={currentParticipantsPage}
                                        setCurrentPage={setCurrentParticipantsPage}>
                                    </PageFooter>}
                                    dataSource={participants.items}
                                    renderItem={item => (
                                        <List.Item key={item["_id"] || item.mail}>
                                            <List.Item.Meta
                                                title={item.mail}
                                            />
                                            { collection.owner ? <DeleteOutlined onClick={() => {
                                                deleteParticipantMutation.mutate({
                                                    collectionId: collectionId,
                                                    participantId: item.id
                                                })
                                            }}/> : null }
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                !isLoadingParticipants && <Text>No participants found for this collection.</Text>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    <Modal
        title="Upload images"
        visible={isUploadModalVisible}
        onCancel={closeModal(setIsUploadModalVisible)}
        footer={null}
        destroyOnClose={true}
        width={600}
    >
        <UploadImageModal
        onSuccess={closeModal(setIsUploadModalVisible)}
        onError={closeModal(setIsUploadModalVisible)}
        collectionId={collection["_id"]}></UploadImageModal>
    </Modal>

        <Modal
            title="Add participant"
            visible={isParticipantModalVisible}
            onCancel={closeModal(setIsParticipantModalVisible)}
            footer={null}
            destroyOnClose={true}
            width={600}
        >
            <AddParticipantModal
                onSuccess={() => {
                    queryClient.invalidateQueries({
                        queryKey: ['collection', collectionId, 'participants', currentParticipantsPage]
                    })
                    closeModal(setIsParticipantModalVisible)}
                }
                onError={closeModal(setIsParticipantModalVisible)}
                collectionId={collection["_id"]}></AddParticipantModal>
        </Modal>
    </>
};

export default CollectionDetailView;