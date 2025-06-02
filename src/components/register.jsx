import React, {useEffect, useState} from 'react';
import {Input, Button, Card, Typography, Space, Alert, message} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {useMutation} from "@tanstack/react-query";
import performRequest from "../performRequest.js";
import {useNavigate} from "react-router";
import log from "loglevel";

const { Title, Link } = Typography;

const RegisterPage = () => {

    useEffect(() => {
        log.info("Mounted register")

        return () => {
            log.info("Unmounted register")
        }
    }, [])

    const navigate = useNavigate()

    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const registerMutation = useMutation({
        mutationFn: performRequest,
        onSuccess: () => {
            message.success("Successfully registered")
            navigate('/login');
        },
        onError: (error) => {
            setError(error.message);
        },
        onMutate: () => {
            console.log("Started mutation")
        },
        onSettled: async () => {
            setLoading(false)
        }
    })

    const handleRegister = async () => {

        setError(null)
        setLoading(true)

        if (!mail || !password) {
            setError('Please provide mail and password')
            setLoading(false)
            return;
        }

        if (password !== repeatPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        registerMutation.mutate({
            url: `http://localhost:8080/register`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: {
                mail: mail,
                password: password,
            },
            parseResponse: "text"
        })

    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            padding: '20px',
            width: '100%',
        }}>
            <Card
                title={<Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>Register</Title>}
                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
            >

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>

                    <Input
                        prefix={<UserOutlined />}
                        placeholder="E-Mail"
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                    />

                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Repeat Password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                    />

                    {error && (
                        <Alert message={error} type="error" showIcon />
                    )}

                    <Button
                        type="primary"
                        onClick={handleRegister}
                        loading={loading}
                        style={{ width: '100%' }}
                    >
                        Register
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <Link href="/login">
                            Already have an account?
                        </Link>
                    </div>
                </Space>

            </Card>
        </div>
    );
};

export default RegisterPage;