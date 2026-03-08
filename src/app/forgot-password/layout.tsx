import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Reset your NexCart account password via email.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
