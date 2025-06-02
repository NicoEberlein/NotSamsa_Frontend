import React, {useState} from 'react';
import {Input, Button, Card, Typography, Space, Alert} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {useMutation} from "@tanstack/react-query";
import performRequest from "../performRequest.js";
import {useNavigate} from "react-router-dom";

const { Title, Link } = Typography;

const LoginPage = () => {

    const navigate = useNavigate()

    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loginMutation = useMutation({
        mutationFn: performRequest,
        onSuccess: (data) => {
            localStorage.setItem("token", data.token)
            navigate("/collections")
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

    const handleLogin = async () => {

        setError(null)
        setLoading(true)

        if (!mail || !password) {
            setError('Please provide mail and password')
            setLoading(false)
            return;
        }

        loginMutation.mutate({
            url: "http://localhost:8080/login",
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json",
                "Accept": "application/json",
            }),
            body: {
                mail: mail,
                password: password,
            }
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
                title={<Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>Login</Title>}
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

                    {error && (
                        <Alert message={error} type="error" showIcon />
                    )}

                    <Button
                        type="primary"
                        onClick={handleLogin}
                        loading={loading}
                        style={{ width: '100%' }}
                    >
                        Login
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <Link href="/register">
                            No Account? Sign up!
                        </Link>
                    </div>
                </Space>

            </Card>
        </div>
    );
};

export default LoginPage;