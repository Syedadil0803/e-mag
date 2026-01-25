import React, { useState } from 'react';
import { Form, Input, Button, Message } from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';
import { signup } from '@demo/services/auth';
import styles from './index.module.scss';

const Signup: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const onFinish = async (values: any) => {
        setLoading(true);

        try {
            const response = await signup({
                email: values.email,
                username: values.username,
                password: values.password,
                name: values.name
            });

            if (response.success) {
                Message.success('Account created successfully! Please login.');
                // Redirect to login page
                setTimeout(() => {
                    history.push('/');
                }, 1500);
            } else {
                Message.error(response.message || 'Signup failed');
            }
        } catch (error: any) {
            Message.error(error.message || 'An error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.leftPanel}>
                    <div className={styles.logo}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 2L4 8L16 14L28 8L16 2Z" fill="#2D5A9E" />
                            <path d="M4 14L16 20L28 14" stroke="#2D5A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 20L16 26L28 20" stroke="#2D5A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.logoText}>University</span>
                    </div>

                    <div className={styles.titleSection}>
                        <h1>Create Your Account</h1>
                        <p>Join our academic publishing platform</p>
                    </div>

                    <Form className={styles.loginForm} layout="vertical" onSubmit={onFinish}>
                        <Form.Item
                            field="name"
                            rules={[{ required: true, message: 'Please input your full name' }]}
                        >
                            <Input
                                placeholder="Full Name"
                                className={styles.inputField}
                            />
                        </Form.Item>

                        <Form.Item
                            field="email"
                            rules={[
                                { required: true, message: 'Please input your email' },
                                { type: 'email', message: 'Please enter a valid email' }
                            ]}
                        >
                            <Input
                                placeholder="Email Address"
                                className={styles.inputField}
                            />
                        </Form.Item>

                        <Form.Item
                            field="username"
                            rules={[
                                { required: true, message: 'Please input your username' },
                                { minLength: 3, message: 'Username must be at least 3 characters' }
                            ]}
                        >
                            <Input
                                placeholder="Username"
                                className={styles.inputField}
                            />
                        </Form.Item>

                        <Form.Item
                            field="password"
                            rules={[
                                { required: true, message: 'Please input your password' },
                                { minLength: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password
                                placeholder="Password"
                                className={styles.inputField}
                                visibilityToggle
                            />
                        </Form.Item>

                        <Form.Item
                            field="confirmPassword"
                            rules={[
                                { required: true, message: 'Please confirm your password' },
                                {
                                    validator: (value, callback) => {
                                        const form = document.querySelector('form');
                                        const passwordInput = form?.querySelector('input[type="password"]') as HTMLInputElement;
                                        if (value && passwordInput && value !== passwordInput.value) {
                                            callback('Passwords do not match');
                                        } else {
                                            callback();
                                        }
                                    }
                                }
                            ]}
                        >
                            <Input.Password
                                placeholder="Confirm Password"
                                className={styles.inputField}
                                visibilityToggle
                            />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" loading={loading} className={styles.signInButton}>
                            Create Account
                        </Button>

                        <div className={styles.divider}>
                            <span>Already have an account?</span>
                        </div>

                        <Button
                            type="secondary"
                            className={styles.ssoButton}
                            onClick={() => history.push('/')}
                        >
                            Sign In Instead
                        </Button>
                    </Form>

                    <footer className={styles.footer}>
                        Powered by <strong>Aairavx</strong>
                    </footer>
                </div>

                <div className={styles.rightPanel}>
                    <img src="/login_illustration_v3.png" alt="Academic Illustration" />
                </div>
            </div>
        </div>
    );
};

export default Signup;
