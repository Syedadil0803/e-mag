import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Message } from '@arco-design/web-react';
import { IconEye, IconEyeInvisible, IconLock, IconUser } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { login, getUserDashboardRoute } from '@demo/services/auth';
import styles from './index.module.scss';

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const onFinish = async (values: any) => {
        setLoading(true);

        try {
            const response = await login({
                username: values.username,
                password: values.password
            });

            if (response.success && response.user) {
                Message.success(`Welcome ${response.user.fullName}!`);

                // Get the appropriate dashboard route based on user role
                const dashboardRoute = getUserDashboardRoute();

                // Redirect to role-specific dashboard
                history.push(dashboardRoute);
            } else {
                Message.error(response.message || 'Login failed');
            }
        } catch (error: any) {
            Message.error(error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.leftPanel}>
                    <div className={styles.logo}>
                        {/* Using a svg or just text to mimic the image logo */}
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 2L4 8L16 14L28 8L16 2Z" fill="#2D5A9E" />
                            <path d="M4 14L16 20L28 14" stroke="#2D5A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 20L16 26L28 20" stroke="#2D5A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.logoText}>University</span>
                    </div>

                    <div className={styles.titleSection}>
                        <h1>Academic eMagazine Platform</h1>
                        <p>Secure institutional publishing portal</p>
                    </div>

                    <Form className={styles.loginForm} layout="vertical" onSubmit={onFinish}>
                        <Form.Item field="username" rules={[{ required: true, message: 'Please input your email or username' }]}>
                            <Input
                                placeholder="Email / Username"
                                className={styles.inputField}
                            />
                        </Form.Item>
                        <Form.Item field="password" rules={[{ required: true, message: 'Please input your password' }]}>
                            <Input.Password
                                placeholder="Password"
                                className={styles.inputField}
                                visibilityToggle
                            />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" loading={loading} className={styles.signInButton}>
                            Sign In
                        </Button>

                        <div className={styles.divider}>
                            <span>OR</span>
                        </div>

                        <Button type="secondary" className={styles.ssoButton}>
                            Sign in with Institution SSO
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

export default Login;
