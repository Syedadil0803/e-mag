import React from 'react';
import { Empty } from '@arco-design/web-react';

const DepartmentsTab: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            padding: '40px'
        }}>
            <Empty
                description={
                    <span style={{ fontSize: 14, color: '#86909c' }}>
                        Coming Soon
                    </span>
                }
            />
        </div>
    );
};

export default DepartmentsTab;
