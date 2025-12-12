describe('Basic Flow', () => {
    it('should navigate to shop and add item to cart', () => {
        cy.visit('/');
        cy.contains('Shop Now').click();
        cy.url().should('include', '/shop');

        // Wait for products to load
        cy.get('button').contains('Add').first().click();

        // Verify cart badge or toast
        cy.contains('Cart').click();
        cy.url().should('include', '/cart');
        cy.contains('Checkout').should('be.visible');
    });

    it('should show login page when accessing profile without auth', () => {
        cy.visit('/profile');
        // Should redirect to login
        cy.url().should('include', '/login');
    });
});
