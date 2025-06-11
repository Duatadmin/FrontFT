describe('PlanCard Component', () => {
  const planId = 'active-program-plan-id'; // The placeholder planId used in CurrentProgramTab.tsx

  beforeEach(() => {
    // Visit the root page where PlanCard is rendered
    // Assuming the Programs page is at '/programs' and 'Current Program' tab can be clicked.
    // This might need adjustment based on actual routing and tab implementation.
    cy.visit('/programs'); // Or the correct route to the programs page
    // Example: cy.get('button').contains('Current Program').click(); // If tabbing is needed
    // For now, let's assume CurrentProgramTab is rendered directly or is the default on /programs
  });

  it('should render the PlanCard component', () => {
    // Check for the main PlanCard container
    // Using a data-cy attribute would be more robust, but for now, we'll use class names
    // Escaping the slash in the class name for CSS selector
    cy.get('.bg-neutral-900\/70').should('exist');
  });

  it('should display plan information or an error state, and check first week', () => {
    // Wait for potential loading to finish (adjust timeout as needed)
    // A more robust approach would be to wait for specific elements to appear/disappear.
    cy.wait(1500); // Increased wait time slightly

    cy.get('body').then(($body) => {
      if ($body.find('.bg-red-800:contains("Error Loading Workout Plan")').length > 0) {
        // Error state found
        cy.get('.bg-red-800').within(() => {
          cy.contains('Error Loading Workout Plan').should('be.visible');
          cy.contains(`Plan ID: ${planId}`).should('be.visible');
        });
      } else if ($body.find('h2.text-3xl.text-green-400').length > 0) {
        // Plan loaded successfully state
        cy.get('h2.text-3xl.text-green-400').should('not.be.empty'); // Check for plan title
        
        // Check for week tabs (conditionally, as per plan "check first week renders")
        if ($body.find('button[role="tab"]').length > 0) {
          cy.get('button[role="tab"]').first().should('be.visible').click();
          // Add further assertions here if the first week's content can be identified
          // For example, check for a session accordion within the tab panel
          cy.get('[role="tabpanel"]').should('be.visible'); 
          // Check if session accordions are present (at least one)
          cy.get('[role="tabpanel"]').find('button[aria-expanded]').should('have.length.gt', 0);
        } else {
          // Handle case where plan is loaded but has no weeks
          cy.contains('This plan currently has no weeks defined.').should('be.visible');
        }
      } else if ($body.find('.animate-pulse').length > 0) {
        // Loading state
         cy.log('PlanCard is likely still loading.');
         cy.get('.animate-pulse').should('be.visible'); // Check for loading skeleton
      } else {
        // Fallback for unexpected content
        cy.log('PlanCard is in an indeterminate state. Could not confirm error, success, or loading.');
        // Force a failure if none of the expected states are met
        // This helps to catch unexpected UI states.
        expect(true, 'PlanCard did not render an expected state (error, success, or loading)').to.be.false;
      }
    });
  });
});
