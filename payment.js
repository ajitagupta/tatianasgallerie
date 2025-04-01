/**
 * Tatianas Galleria Zahlungsintegration
 * Kreditkartenzahlungsverarbeitung mit Stripe Elements
 */

class PaymentProcessor {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.card = null;
        this.form = document.getElementById('checkout-form');
        this.errorElement = document.getElementById('card-errors');
        this.submitButton = document.getElementById('place-order-btn');
        this.backButton = document.getElementById('back-to-cart-btn');
        
        // Stripe Publishable Key aus Umgebungsvariable
        this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_default_key';
        
        // Stripe.js sofort laden
        this.loadStripeJs();
        
        // Initialisierung protokollieren
        console.log('PaymentProcessor initialisiert');
    }
    
    /**
     * Stripe.js-Bibliothek dynamisch laden
     */
    loadStripeJs() {
        console.log('Stripe.js wird geladen');
        
        // Prüfen, ob Stripe bereits geladen ist
        if (window.Stripe) {
            console.log('Stripe bereits geladen');
            this.initializeStripe();
            return;
        }
        
        // Script-Element erstellen
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        
        // Callback für erfolgreiches Laden einrichten
        script.onload = () => {
            console.log('Stripe.js erfolgreich geladen');
            this.initializeStripe();
        };
        
        // Fehlerbehandlung beim Laden
        script.onerror = (error) => {
            console.error('Fehler beim Laden von Stripe.js', error);
            if (this.errorElement) {
                this.errorElement.textContent = 'Zahlungssystem nicht verfügbar. Bitte versuchen Sie es später erneut.';
            }
        };
        
        // Script zum Dokument hinzufügen
        document.head.appendChild(script);
        console.log('Stripe.js-Script zum Dokument hinzugefügt');
    }
    
    /**
     * Stripe mit Publishable Key initialisieren und Elements einrichten
     */
    initializeStripe() {
        console.log('Stripe wird initialisiert');
        
        try {
            // Stripe mit Publishable Key initialisieren
            console.log('Verwendeter Publishable Key:', this.stripePublishableKey);
            this.stripe = Stripe(this.stripePublishableKey);
            console.log('Stripe mit Publishable Key initialisiert');
            
            // Elements-Instanz erstellen
            this.elements = this.stripe.elements();
            console.log('Stripe Elements erstellt');
            
            // Card Element erstellen und einbinden
            this.createCardElement();
            
            // Formular-Übermittlungshandler einrichten
            this.setupFormHandler();
        } catch (error) {
            console.error('Fehler bei der Initialisierung von Stripe:', error);
            if (this.errorElement) {
                this.errorElement.textContent = 'Fehler bei der Initialisierung des Zahlungssystems. Bitte laden Sie die Seite neu.';
            }
        }
    }

    // Rest of the code remains the same as in the original file...
}

// Für Tests ohne Backend-Server - auf false setzen, wenn das Backend bereit ist
window.USE_ACTUAL_BACKEND = false;

// PaymentProcessor initialisieren, wenn das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM geladen, PaymentProcessor wird initialisiert');
    window.paymentProcessor = new PaymentProcessor();
});