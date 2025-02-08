type PropertyType = 'house' | 'apartment'

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