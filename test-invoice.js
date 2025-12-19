
const testInvoice = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/generate-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: "TEST-12345",
                customer: {
                    name: "Test User",
                    email: "test@example.com",
                    address: "123 Test Lane"
                },
                items: [
                    { name: "Test Item 1", price: 100, quantity: 2 },
                    { name: "Test Item 2", price: 50, quantity: 1 }
                ]
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
};

testInvoice();
