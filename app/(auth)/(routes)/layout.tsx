import React, { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="h-full flex items-center justify-center">
            {children}
        </div>
    );
}

export default AuthLayout;

