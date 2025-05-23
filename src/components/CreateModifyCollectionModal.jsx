import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import performRequest from "../performRequest.js";

const { Text } = Typography;

const CreateModifyCollectionModal = ({ onSuccess, onError, modify, collection }) => {

    const [description, setDescription] = useState(modify ? collection.description : '');
    const [name, setName] = useState(modify ? collection.name : '');

    const queryClient = useQueryClient();

    const modifyCollectionRequest = async ({body, modify=false, collectionId=undefined}) => {
        return performRequest({
            url: modify ? `http://localhost:8080/collections/${collectionId}` : "http://localhost:8080/collections",
            method: modify ? "PATCH" : "POST",
            appendAuthorization: true,
            body: body
        })
    }

    const createCollectionMutation = useMutation({
        mutationFn: modifyCollectionRequest,
        onSuccess: () => {
            onSuccess()
            queryClient.invalidateQueries({
                queryKey: modify ? ["collections", collection.id] : ["collections"],
            })
        },
        onError: (err) => {
            onError(err)
        }
    })

    const [form] = Form.useForm();

    return (
        <Form
            form={form}
            layout="vertical"
            name="create_collection_form"
            onFinish={() => {
                if(modify) {
                    createCollectionMutation.mutate({
                        body: {name: name, description: description},
                        modify: true,
                        collectionId: collection.id,
                    })
                }else {
                    createCollectionMutation.mutate({
                        body: {name: name, description: description}
                    })
                }
            }}
        >
            <Form.Item
                label="Name"
                name="name"
            >
                <Input
                    value={name}
                    placeholder="Name"
                    onChange={(e) => {setName(e.target.value)}}/>
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
            >
                <Input.TextArea
                    value={description}
                    placeholder="Description" rows={3}
                    onChange={(e) => {setDescription(e.target.value)}}/>
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={false}
                    style={{ width: '100%' }}
                >
                    {modify ? "Edit" : "Create"} collection
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CreateModifyCollectionModal;