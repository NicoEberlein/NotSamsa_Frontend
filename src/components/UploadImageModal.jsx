import React, {useEffect, useState} from 'react';
import {Button, message, Typography, Upload} from 'antd';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import { UploadOutlined } from "@ant-design/icons";
import log from "loglevel";

const { Text } = Typography;

const UploadImageModal = ({ onSuccess, onError, collectionId }) => {

    useEffect(() => {
        log.info("Mounted UploadImageModal");

        return () => {
            log.info("Unmounted UploadImageModal");
        }
    }, [])

    const queryClient = useQueryClient();

    const uploadImagesMutation = useMutation({
        mutationFn: async ({ files, collectionId}) => {
                const formData = new FormData();
                files.forEach((file) => {
                    formData.append('images', file.originFileObj);
                })
                const data = await fetch(`http://localhost:8080/collections/${collectionId}/images`, {
                    method: 'POST',
                    headers: new Headers({Authorization: `Bearer ${localStorage.getItem("token")}`}),
                    body: formData,
                })
                return data
        },
        onSuccess: () => {
            message.success(`${fileList.length} image(s) uploaded successfully!`)
            queryClient.invalidateQueries({
                queryKey: ['collection', collectionId, 'images']
            })
            setFileList([])
            onSuccess()
        },
        onError: (error) => {
            console.log(error)
            onError()
        }
    })

    const handleUploadButtonClick = () => {
        uploadImagesMutation.mutate({
            collectionId: collectionId,
            files: fileList
        })
    }

    const [fileList, setFileList] = useState([])

    return <>
            <Upload
                multiple
                accept=".jpg,.jpeg,.png,.gif"
                onChange={({fileList: newFileList}) => {
                    setFileList(newFileList);
                }}
                fileList={fileList}
                progress
                beforeUpload={() => false}
            >
                <Button icon={<UploadOutlined/>} size="small">Select files</Button>
            </Upload>
        {fileList.length > 0 && (
            <Button
                type="primary"
                onClick={handleUploadButtonClick}
                loading={uploadImagesMutation.isLoading}
                disabled={uploadImagesMutation.isLoading}
                style={{ marginBottom: 16 }}
            >
                Upload Selected Images
            </Button>
        )}
    </>
};

export default UploadImageModal;