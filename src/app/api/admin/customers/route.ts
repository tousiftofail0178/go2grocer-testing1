import { NextResponse } from 'next/server';

// Mock Data for Customers
let customers = [
    {
        id: '1',
        name: 'Petty Stuff',
        email: 'petty@example.com',
        subscription: 'Subscribed',
        location: 'Chittagong, Bangladesh',
        orders: 0,
        spent: 'Tk 0.00',
        initial: 'P'
    },
    {
        id: '2',
        name: 'John Doe',
        email: 'john@example.com',
        subscription: 'Not subscribed',
        location: 'Dhaka, Bangladesh',
        orders: 2,
        spent: '€120.50',
        initial: 'J'
    }
];

export async function GET() {
    return NextResponse.json(customers);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newCustomer = {
            id: Math.random().toString(36).substr(2, 9),
            name: `${body.firstName} ${body.lastName}`,
            email: body.email,
            subscription: body.marketingEmail ? 'Subscribed' : 'Not subscribed',
            location: body.address ? `${body.address.city}, ${body.address.country}` : 'Unknown',
            orders: 0,
            spent: 'Tk 0.00',
            initial: body.firstName.charAt(0)
        };

        customers.push(newCustomer);
        return NextResponse.json(newCustomer, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
