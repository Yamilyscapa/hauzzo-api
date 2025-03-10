type PropertyType = 'house' | 'apartment'
type UserType = 'user' | 'broker'

export type Error = {
    message: string;
    status: number;
    error?: any
}

type Property = {
    id: string;
    title: string;
    description: string;
    price: number;
    tags: string[];
    bedrooms: number;
    bathrooms: number;
    parking: number;
    location: {
        zip: string;
        city: string;
        state: string;
        street: string;
        address: string;
        neighborhood: string;
        addressNumber: string;
    };
    type: "house" | "apartment",
    transaction: "rent" | "sale",
    images: string[];
    active: boolean;
    broker_id: string;
};

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