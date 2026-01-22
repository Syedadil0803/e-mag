
import React from 'react';
import { Card, Statistic } from '@arco-design/web-react';
import styles from './Components.module.scss';

interface StatCardProps {
    title: string;
    count: number;
    color?: string;
    icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, color = '#2D5A9E', icon }) => {
    return (
        <Card className={styles.statCard} style={{ borderLeft: `4px solid ${color}` }}>
            <div className={styles.statContent}>
                <div className={styles.statInfo}>
                    <div className={styles.statTitle}>{title}</div>
                    <div className={styles.statValue}>{count}</div>
                </div>
                {icon && <div className={styles.statIcon} style={{ color }}>{icon}</div>}
            </div>
            <div className={styles.statChartStub} style={{ background: `linear-gradient(90deg, ${color}22 0%, transparent 100%)` }} />
        </Card>
    );
};

export default StatCard;
