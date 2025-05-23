import React, { useState } from 'react';
import {Button, Input, message, Typography, Upload} from 'antd';
import { useMutation } from '@tanstack/react-query';
import {PlusOutlined, UploadOutlined} from "@ant-design/icons";
import performRequest from "../performRequest.js";

const { Text } = Typography;

const UploadImageModal = ({ onSuccess, onError, collectionId }) => {

    const [participant, setParticipant] = useState("");

    const addParticipantMutation = useMutation({
        mutationFn: async ({collectionId, userMails}) => {
            return performRequest({
                url: `http://localhost:8080/collections/${collectionId}/participants`,
                method: 'POST',
                body: {userMails: userMails},
                appendAuthorization: true
            })
        },
        onSuccess: () => {
            message.success(`Participant added successfully`)
            onSuccess()
        },
        onError: (error) => {
            message.error(error)
            onError()
        }
    })

    const handleAddParticipant = () => {
        addParticipantMutation.mutate({
            collectionId: collectionId,
            userMails: [participant]
        })
    }

    return <>
        <Input placeholder="Participant mail" onChange={e => setParticipant(e.target.value)} />
        <Button type="primary" onClick={handleAddParticipant} icon={<PlusOutlined/>}></Button>
    </>
};

export default UploadImageModal;