type PropertyType = 'house' | 'apartment'
type UserType = {
    user: 'user',
    broker: 'broker'
}

export type Error = {
    message: string;
    status: number;
    error?: any
}

export interface Property {
    id: string;
    title: string;
    description: string;
    location: string;
    tags: string[];
    price: number;
    brokerId: string;
    type: PropertyType;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: UserType.user;
}

export interface Broker extends User {
    role: UserType.broker
}