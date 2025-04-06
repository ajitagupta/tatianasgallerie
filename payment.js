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
        this.cardDetailsContainer = document.getElementById('kreditkartendetails-container');
        
        // Stripe Publishable Key aus Umgebungsvariable oder Default-Wert
        this.stripePublishableKey = 'pk_live_51R9MfC2NrW10WJyBwBAjxMVcb1KSeZuoIxFSN4NXahxRtSlOrfJM91hsdcz1YA2d8eXZABokjrbTCs60Mln4imNz00tZMkktjf';
        
        // Stripe.js sofort laden
        this.loadStripeJs();
        
        // Alternative Kreditkartenfelder anzeigen, falls Stripe nicht verfügbar ist
        this.showFallbackCardFields();
        
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
     * Alternative Kreditkartenfelder anzeigen
     */
    showFallbackCardFields() {
        // Sicherstellen, dass der Container für Kreditkartendetails existiert
        if (!this.cardDetailsContainer) {
            const kreditkartendetailsLabel = document.querySelector('label[for="kreditkartendetails"]');
            if (kreditkartendetailsLabel) {
                // Container nach dem Label erstellen
                this.cardDetailsContainer = document.createElement('div');
                this.cardDetailsContainer.id = 'kreditkartendetails-container';
                kreditkartendetailsLabel.parentNode.insertBefore(this.cardDetailsContainer, kreditkartendetailsLabel.nextSibling);
            } else {
                // Fallback, falls Label nicht gefunden wird
                const kreditkartenSection = document.querySelector('.payment-form-section') || 
                                          document.getElementById('checkout-form');
                if (kreditkartenSection) {
                    this.cardDetailsContainer = document.createElement('div');
                    this.cardDetailsContainer.id = 'kreditkartendetails-container';
                    kreditkartenSection.appendChild(this.cardDetailsContainer);
                }
            }
        }
        
        // Sicherstellen, dass der Container existiert, bevor wir fortfahren
        if (this.cardDetailsContainer) {
            // Standardmäßige Kreditkartenfelder erstellen
            this.cardDetailsContainer.innerHTML = `
                <div class="card-field-group">
                    <div class="form-group">
                        <label for="card-number">Kartennummer</label>
                        <input type="text" id="card-number" class="form-control" placeholder="1234 5678 9012 3456" required>
                    </div>
                    <div class="form-row" style="display: flex; gap: 15px;">
                        <div class="form-group" style="flex: 1;">
                            <label for="expiry-date">Ablaufdatum</label>
                            <input type="text" id="expiry-date" class="form-control" placeholder="MM/YY" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="cvv-code">Sicherheitscode</label>
                            <input type="text" id="cvv-code" class="form-control" placeholder="123" required>
                        </div>
                    </div>
                </div>
                <div id="card-errors" class="error-message" style="color: red; margin-top: 10px;"></div>
            `;
            
            this.errorElement = document.getElementById('card-errors');
        }
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
    
    /**
     * Stripe Card Element erstellen und in das Formular einbinden
     */
    createCardElement() {
        console.log('Card Element wird erstellt');
        
        // Sicherstellen, dass der Container existiert
        if (!this.cardDetailsContainer) {
            console.error('Kreditkartendetails-Container nicht gefunden');
            return;
        }
        
        // Vorhandene Inhalte löschen
        this.cardDetailsContainer.innerHTML = '';
        
        // Container für das Stripe Element erstellen
        const stripeElementsContainer = document.createElement('div');
        stripeElementsContainer.id = 'card-element';
        stripeElementsContainer.style.padding = '10px';
        stripeElementsContainer.style.border = '1px solid #ddd';
        stripeElementsContainer.style.borderRadius = '4px';
        stripeElementsContainer.style.backgroundColor = '#fff';
        
        // Container für Fehlermeldungen erstellen
        const errorContainer = document.createElement('div');
        errorContainer.id = 'card-errors';
        errorContainer.style.color = 'red';
        errorContainer.style.marginTop = '10px';
        errorContainer.style.fontSize = '14px';
        
        // Elemente zum Container hinzufügen
        this.cardDetailsContainer.appendChild(stripeElementsContainer);
        this.cardDetailsContainer.appendChild(errorContainer);
        
        // Referenz zum Fehlerelement aktualisieren
        this.errorElement = errorContainer;
        
        // Stripe Card Element-Optionen
        const style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        };
        
        // Card Element erstellen
        this.card = this.elements.create('card', { style: style });
        
        // Card Element mounten
        this.card.mount('#card-element');
        console.log('Card Element erstellt und gemountet');
        
        // Event-Listener für Änderungen und Fehler hinzufügen
        this.card.on('change', event => {
            if (event.error) {
                this.errorElement.textContent = event.error.message;
            } else {
                this.errorElement.textContent = '';
            }
        });
    }
    
    /**
     * Formular-Übermittlungshandler einrichten
     */
    setupFormHandler() {
        console.log('Formular-Handler wird eingerichtet');
        
        if (!this.form) {
            console.error('Checkout-Formular nicht gefunden');
            return;
        }
        
        // Zurück-Button-Handler
        if (this.backButton) {
            this.backButton.addEventListener('click', event => {
                event.preventDefault();
                // Ruft die handleBackToCart-Methode des ShoppingCart-Objekts auf
                if (window.brushstrokesCart) {
                    window.brushstrokesCart.handleBackToCart();
                }
            });
        }
        
        // Formular-Übermittlungshandler
        this.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Formular übermittelt');
            
            // Absende-Button deaktivieren
            if (this.submitButton) {
                this.submitButton.disabled = true;
                this.submitButton.textContent = 'Verarbeitung...';
            }
            
            if (!this.stripe || !this.card) {
                console.error('Stripe oder Card Element nicht verfügbar');
                this.handlePaymentError('Zahlungssystem nicht bereit. Bitte laden Sie die Seite neu.');
                return;
            }
            
            try {
                // Payment Intent anfordern - im Testmodus simulieren wir dies
                if (window.USE_ACTUAL_BACKEND) {
                    // Echter Backend-Aufruf
                    const response = await this.createPaymentIntent();
                    const clientSecret = response.clientSecret;
                    
                    if (!clientSecret) {
                        throw new Error("Missing clientSecret from backend response.");
                    }

                    // Zahlung bestätigen
                    const result = await this.stripe.confirmCardPayment(clientSecret, {
                        payment_method: {
                            card: this.card,
                            billing_details: {
                                name: document.getElementById('card-name').value
                            }
                        }
                    });
                    
                    if (result.error) {
                        this.handlePaymentError(result.error.message);
                    } else if (result.paymentIntent.status === 'succeeded') {
                        this.handlePaymentSuccess();
                    }
                } else {
                    // Simulierter Erfolg für Testzwecke
                    console.log('Simulierte Zahlung (kein echter Backend-Aufruf)');
                    setTimeout(() => {
                        // 90% Erfolgsrate simulieren
                        if (Math.random() < 0.9) {
                            this.handlePaymentSuccess();
                        } else {
                            this.handlePaymentError('Simulierter Zahlungsfehler für Testzwecke');
                        }
                    }, 2000);
                }
            } catch (error) {
                console.error('Fehler bei der Zahlungsverarbeitung:', error);
                this.handlePaymentError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
            }
        });
        
        console.log('Formular-Handler eingerichtet');
    }
    
    /**
     * Payment Intent vom Backend-Server anfordern
     * @returns {Promise<Object>} - Response mit clientSecret
     */
    async createPaymentIntent() {
        try {
            // Prefer checkout email, fallback to contact form email
            const emailInput = 
                document.getElementById('checkout-email') || 
                document.getElementById('email');
            
            const email = emailInput ? emailInput.value.trim() : '';
            
            // Basic email validation
            if (!email || !email.includes('@')) {
                throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
            }
            
            // Create Payment Method
            const paymentMethodResult = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.card
            });
            
            if (paymentMethodResult.error) {
                throw new Error(paymentMethodResult.error.message || 'Fehler bei der Erstellung der Zahlungsmethode');
            }

            const customerInfo = {
                name: `${document.getElementById('first-name').value.trim()} ${document.getElementById('last-name').value.trim()}`,
                email: document.getElementById('checkout-email')?.value.trim() || '',
                address: {
                  line1: document.getElementById('address').value.trim(),
                  city: document.getElementById('city').value.trim(),
                  state: document.getElementById('state').value.trim(),
                  postal_code: document.getElementById('zip').value.trim(),
                  country: document.getElementById('country').value
                }
            };
            
            const itemSummary = window.brushstrokesCart?.cart.map(item => 
                `${item.title} (${item.quantity}x)`
            ).join(', ');
            
            const orderData = {
                paymentMethodId: paymentMethodResult.paymentMethod.id,
                amount: window.brushstrokesCart ? window.brushstrokesCart.calculateTotal() : 0,
                items: window.brushstrokesCart?.cart || [],
                itemSummary: itemSummary,
                customerInfo
            };
            
            // API request to backend
            try {
                const response = await fetch('/api/process-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                
                const responseJson = await response.json();
                console.log('Parsed response:', responseJson);
                
                if (!response.ok) {
                    throw new Error(responseJson.message || 'Fehler beim Erstellen des Payment Intent');
                }
                
                return responseJson;
                
                
                return JSON.parse(responseBody);
            } catch (fetchError) {
                console.error('Fetch Error Details:', {
                    name: fetchError.name,
                    message: fetchError.message,
                    stack: fetchError.stack
                });
                
                throw fetchError;
            }
        } catch (error) {
            console.error('Complete Error Details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            throw error;
        }
    }
    
    /**
     * Erfolgreiche Zahlung behandeln
     */
    handlePaymentSuccess() {
        console.log('Zahlung erfolgreich');
        
        // Absende-Button zurücksetzen
        if (this.submitButton) {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Bestellung aufgeben';
        }
        
        // Warenkorb leeren
        if (window.brushstrokesCart) {
            window.brushstrokesCart.clearCart();
        }
        
        // Bestätigungsseite anzeigen
        const checkoutForm = document.getElementById('checkout-form');
        const orderConfirmation = document.getElementById('order-confirmation');
        
        if (checkoutForm) {
            checkoutForm.style.display = 'none';
        }
        
        if (orderConfirmation) {
            orderConfirmation.style.display = 'block';
        }
        
        // Optional: Bestellnummer generieren und anzeigen
        const orderNumber = document.getElementById('order-number');
        if (orderNumber) {
            orderNumber.textContent = 'TG-' + Math.floor(100000 + Math.random() * 900000);
        }
    }
    
    /**
     * Zahlungsfehler behandeln
     * @param {string} errorMessage - Fehlermeldung
     */
    handlePaymentError(errorMessage) {
        console.error('Zahlungsfehler:', errorMessage);
        
        // Fehlermeldung anzeigen
        if (this.errorElement) {
            this.errorElement.textContent = errorMessage;
        }
        
        // Absende-Button zurücksetzen
        if (this.submitButton) {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Bestellung aufgeben';
        }
    }
}

// Für Tests ohne Backend-Server - auf false setzen, wenn das Backend bereit ist
window.USE_ACTUAL_BACKEND = true;

// PaymentProcessor initialisieren, wenn das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM geladen, PaymentProcessor wird initialisiert');
    window.paymentProcessor = new PaymentProcessor();
});