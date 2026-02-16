export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Student = {
    id: number;
    name: string;
    grade: number;
    class: number;
    year: number;
    is_student_account: boolean;
};

export type Auth = {
    user?: User;
    student?: Student;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
