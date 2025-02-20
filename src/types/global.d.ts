type PropertyType = 'house' | 'apartment'
type UserType = 'user' | 'broker'

export type Error = {
    message: string;
    status: number;
    error?: any
}

type Property = {
    title: string;
    description: string;
    price: number;
    tags: string[];
    bedrooms: number;
    bathrooms: number;
    parking: number;
    type: PropertyType;
    location: {
        address: string;
        addressNumber: string;
        street: string;
        neighborhood: string;
        city: string;
        state: string;
        zip: string;
    };
    images: string[];
    brokerId: string;
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