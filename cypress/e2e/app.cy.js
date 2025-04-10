describe('Step Towards the Light', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('shows main navigation', () => {
    cy.get('nav').should('be.visible')
    cy.get('nav').contains('Home')
    cy.get('nav').contains('About')
    cy.get('nav').contains('Content')
    cy.get('nav').contains('Community')
    cy.get('nav').contains('Events')
    cy.get('nav').contains('Shop')
  })

  it('can navigate to all main pages', () => {
    // Home page content
    cy.get('h1').contains('Welcome to Step Towards the Light')
    
    // About page
    cy.get('nav').contains('About').click()
    cy.get('h1').contains('About Us')
    
    // Content page
    cy.get('nav').contains('Content').click()
    cy.get('h1').contains('Islamic Content')
    
    // Community page
    cy.get('nav').contains('Community').click()
    cy.get('h1').contains('Our Community')
    
    // Events page
    cy.get('nav').contains('Events').click()
    cy.get('h1').contains('Events Calendar')
    
    // Shop page
    cy.get('nav').contains('Shop').click()
    cy.get('h1').contains('Islamic Shop')
  })

  it('checks responsive design', () => {
    // Mobile view
    cy.viewport('iphone-x')
    cy.get('nav').should('be.visible')
    
    // Tablet view
    cy.viewport('ipad-2')
    cy.get('nav').should('be.visible')
    
    // Desktop view
    cy.viewport(1920, 1080)
    cy.get('nav').should('be.visible')
  })
})
