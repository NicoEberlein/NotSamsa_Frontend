import React, {useEffect, useState} from 'react';
import {Card, Typography, Button, Modal, message} from 'antd';
import {
    PictureOutlined,
    ExclamationCircleOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import {useMutation, useQueryClient} from "@tanstack/react-query";
import performRequest from "../performRequest.js";
import {useNavigate} from "react-router-dom";
import CreateModifyCollectionModal from "./CreateModifyCollectionModal.jsx";
import log from "loglevel"; // Icons

const { Title, Text } = Typography;
const { confirm } = Modal

const CollectionCard = ({ collection }) => {

    useEffect(() => {
        log.info("Mounted CollectionCard");

        return () => {
            log.info("Unmounted CollectionCard")
        }
    }, [])

    const navigate = useNavigate()

    const queryClient = useQueryClient();

    const [isEditModalVisible, setEditModalVisible] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: async () => {
            return performRequest({
                url: `http://localhost:8080/collections/${collection["_id"]}`,
                method: "DELETE",
                appendAuthorization: true,
                parseResponse: "text"
            })
        },
        onSuccess: () => {
            message.success('Collection deleted successfully.');
            queryClient.invalidateQueries({
                queryKey: ["collections"],
            })
        },
        onError: (error) => {
            console.log(error);
            message.error(error.message);
        },
    })

    if (!collection) {
        return null;
    }

    const showDeleteConfirm = () => {
        confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: (<Text>Are you sure you want to delete collection <Text strong>{collection.name}</Text>?</Text>),
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: () => {
                deleteMutation.mutate(collection["_id"])
            }
        })
    }

    return <>
        <Card
            hoverable
            cover={
                collection.previewImageUrl ? (
                    <img alt={collection.name || 'Collection Preview'} src={collection.previewImageUrl} style={{ height: 300, objectFit: 'cover' }} />
                ) : (
                    <div style={{ height: 200, backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
                        <PictureOutlined style={{ fontSize: 48 }} />
                        <Text style={{ marginLeft: 8 }}>No image</Text>
                    </div>
                )
            }

             actions={[
                 <Button
                     type="link"
                    onClick={() => {
                        navigate(`/collections/${collection["_id"]}`)
                    }}>Details</Button>,
                 <Button
                     type="text"
                     onClick={() => {setEditModalVisible(true)}}
                     disabled={!collection.owner}
                     title={collection.owner ? "Edit collection" : "Only the owner is allowed to edit a collection"}
                 >Edit</Button>,
                 <Button
                     type="text"
                     danger
                     icon={<DeleteOutlined />}
                     key="delete"
                     onClick={showDeleteConfirm}
                     disabled={deleteMutation.isPending || !collection.owner}
                     title={collection.owner ? "Delete collection" : "Only the owner is allowed to delete a collection"}
                     >Delete</Button>
             ]}
        >
            <Card.Meta
                title={<Title level={4} style={{ margin: 0 }}>{collection.name}</Title>}
                description={<Text type="secondary">{collection.description}</Text>}
            />

        </Card>

        <Modal
            title={`Edit collection ${collection.name}`}
            visible={isEditModalVisible}
            onCancel={() => {setEditModalVisible(false);}}
            footer={null}
            destroyOnClose={true}
            width={600}
        >
            <CreateModifyCollectionModal
                onClose={() => {setEditModalVisible(false);}}
                onSuccess={() => {setEditModalVisible(false);}}
                onError={(err) => {
                    setEditModalVisible(false)
                    message.error(err.message);
                }}
                modify={true}
                collection={collection}
            />
        </Modal>

    </>
};

export default CollectionCard;