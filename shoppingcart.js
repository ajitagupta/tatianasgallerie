/**
 * Tatianas Galleria Warenkorb
 * Ein eigenständiges Warenkorbsystem für Kunst-E-Commerce
 */

class ShoppingCart {
    constructor() {
        // Warenkorb-Daten initialisieren
        this.cart = [];
        this.shippingCostPerItem = 50; // CHF 50 Versandkosten pro Artikel
        
        // DOM-Elemente
        this.cartCount = document.querySelector('.cart-count');
        this.cartSection = document.getElementById('cart');
        this.cartItems = document.getElementById('cart-items');
        this.cartSummary = document.getElementById('cart-summary');
        this.emptyCartMessage = document.getElementById('empty-cart-message');
        this.subtotalElement = document.getElementById('cart-subtotal');
        this.shippingElement = document.getElementById('cart-shipping');
        this.totalElement = document.getElementById('cart-total');
        this.checkoutBtn = document.getElementById('checkout-btn');
        this.continueShoppingBtn = document.getElementById('continue-shopping-btn');
        this.checkoutForm = document.getElementById('checkout-form');
        this.backToCartBtn = document.getElementById('back-to-cart-btn');
        this.placeOrderBtn = document.getElementById('place-order-btn');
        this.orderConfirmation = document.getElementById('order-confirmation');
        this.continueShoppingConfirmation = document.getElementById('continue-shopping-confirmation');
        
        // Warenkorb initialisieren
        this.init();
    }
    
    /**
     * Warenkorb initialisieren
     */
    init() {
        // WICHTIG: Warenkorb aus localStorage laden, bevor wir andere Aktionen ausführen
        this.loadCart();
        
        // In den Warenkorb-Button Klick-Event
        const addToCartButtons = document.querySelectorAll('.btn');
        addToCartButtons.forEach(button => {
            if (button.textContent === 'In den Warenkorb') {
                button.addEventListener('click', this.handleAddToCart.bind(this));
            }
        });
        
        // Warenkorb-Icon Klick-Event
        const cartIcon = document.querySelector('.cart-icon a');
        if (cartIcon) {
            cartIcon.addEventListener('click', this.handleCartIconClick.bind(this));
        }
        
        // Weiter einkaufen Button Klick
        if (this.continueShoppingBtn) {
            this.continueShoppingBtn.addEventListener('click', this.handleContinueShopping.bind(this));
        }
        
        // Zur Kasse Button Klick
        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', this.handleCheckout.bind(this));
        }
        
        // Zurück zum Warenkorb Button Klick
        if (this.backToCartBtn) {
            this.backToCartBtn.addEventListener('click', this.handleBackToCart.bind(this));
        }
        
        // Bestellung aufgeben Button Klick
        if (this.placeOrderBtn) {
            this.placeOrderBtn.addEventListener('click', this.handlePlaceOrder.bind(this));
        }
        
        // Weiter einkaufen von Bestätigung
        if (this.continueShoppingConfirmation) {
            this.continueShoppingConfirmation.addEventListener('click', this.handleContinueFromConfirmation.bind(this));
        }
        
        // Warenkorbzähler sofort aktualisieren
        this.updateCartCount();
    }
    
    /**
     * Hinzufügen eines Produkts zum Warenkorb handhaben
     * @param {Event} event - Das Klick-Event
     */
    handleAddToCart(event) {
        // Produktinformationen abrufen
        const button = event.currentTarget;
        const card = button.closest('.product-card');
        const title = card.querySelector('.product-title').textContent;
        const price = card.querySelector('.product-price').textContent;
        const priceValue = parseFloat(price.replace('CHF', '').trim());
        const size = card.querySelector('.product-size').textContent;
        const imageSrc = card.querySelector('.product-image').style.backgroundImage;
        
        // Prüfen, ob Artikel bereits im Warenkorb ist (prüfe sowohl Titel als auch Größe)
        const existingItemIndex = this.cart.findIndex(item => 
            item.title === title && item.size === size
        );
        
        if (existingItemIndex > -1) {
            // Menge erhöhen
            this.cart[existingItemIndex].quantity += 1;
        } else {
            // Neuen Artikel hinzufügen
            this.cart.push({
                title: title,
                price: priceValue,
                size: size, // Größe des Gemäldes hinzufügen
                quantity: 1,
                image: imageSrc
            });
        }
        
        // Warenkorb in localStorage speichern
        this.saveCart();
        
        // Warenkorbzähler aktualisieren
        this.updateCartCount();
        
        // Bestätigung anzeigen
        this.showAddedToCartMessage();
    }
    
    /**
     * "Zum Warenkorb hinzugefügt" Bestätigungsnachricht anzeigen
     */
    showAddedToCartMessage() {
        const confirmMessage = document.createElement('div');
        confirmMessage.classList.add('confirmation-message');
        confirmMessage.textContent = 'Zum Warenkorb hinzugefügt!';
        confirmMessage.style.position = 'fixed';
        confirmMessage.style.bottom = '20px';
        confirmMessage.style.right = '20px';
        confirmMessage.style.background = '#c9a66b'; // Anpassung an Website-Farbschema
        confirmMessage.style.color = 'white';
        confirmMessage.style.padding = '10px 20px';
        confirmMessage.style.borderRadius = '4px';
        confirmMessage.style.zIndex = '1000';
        confirmMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        document.body.appendChild(confirmMessage);
        
        // Mit Animation einblenden
        confirmMessage.style.opacity = '0';
        confirmMessage.style.transform = 'translateY(20px)';
        confirmMessage.style.transition = 'opacity 0.3s, transform 0.3s';
        
        setTimeout(() => {
            confirmMessage.style.opacity = '1';
            confirmMessage.style.transform = 'translateY(0)';
        }, 10);
        
        // Nach 2 Sekunden ausblenden
        setTimeout(() => {
            confirmMessage.style.opacity = '0';
            confirmMessage.style.transform = 'translateY(20px)';
            
            // Nach dem Ausblenden Element entfernen
            setTimeout(() => {
                confirmMessage.remove();
            }, 300);
        }, 2000);
    }
    
    /**
     * Warenkorb-Icon Klick handhaben
     * @param {Event} event - Das Klick-Event
     */
    handleCartIconClick(event) {
        event.preventDefault();
        this.showCart();
    }
    
    /**
     * Weiter einkaufen Button Klick handhaben
     */
    handleContinueShopping() {
        this.cartSection.style.display = 'none';
        window.location.href = '#products';
    }
    
    /**
     * Zur Kasse Button Klick handhaben
     */
    handleCheckout() {
        this.cartItems.style.display = 'none';
        this.cartSummary.style.display = 'none';
        this.checkoutBtn.style.display = 'none';
        this.continueShoppingBtn.style.display = 'none';
        this.checkoutForm.style.display = 'block';
    }
    
    /**
     * Zurück zum Warenkorb Button Klick handhaben
     */
    handleBackToCart() {
        // Checkout-Formular ausblenden
        if (this.checkoutForm) {
            this.checkoutForm.style.display = 'none';
        }
        
        // Warenkorb-Elemente anzeigen
        if (this.cartItems) {
            this.cartItems.style.display = 'block';
        }
        
        // "Weiter einkaufen"-Button anzeigen
        if (this.continueShoppingBtn) {
            this.continueShoppingBtn.style.display = 'block';
        }
        
        // Warenkorbzusammenfassung und Checkout-Button basierend auf Warenkorb-Status anzeigen
        const hasItems = this.cart.length > 0;
        
        if (this.cartSummary) {
            this.cartSummary.style.display = hasItems ? 'block' : 'none';
        }
        
        if (this.checkoutBtn) {
            this.checkoutBtn.style.display = hasItems ? 'block' : 'none';
        }
        
        if (this.emptyCartMessage) {
            this.emptyCartMessage.style.display = hasItems ? 'none' : 'block';
        }
        
        // Cart-Anzeige aktualisieren, um sicherzustellen, dass alle Elemente korrekt sind
        this.updateCartDisplay();
    }
    
    /**
     * Bestellung aufgeben Button Klick handhaben
     */
    handlePlaceOrder() {
        // Formular-Übermittlung wird von payment.js gehandhabt
    }
    
    /**
     * Weiter einkaufen von Bestätigung handhaben
     */
    handleContinueFromConfirmation() {
        this.orderConfirmation.style.display = 'none';
        this.cartSection.style.display = 'none';
        window.location.href = '#products';
    }
    
    /**
     * Warenkorbzähler aktualisieren
     */
    updateCartCount() {
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update cart count in header
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
        }
        
        // Update cart UI elements if they exist (we might be on a page without the cart section)
        if (this.emptyCartMessage && this.cartSummary && this.checkoutBtn) {
            if (totalItems === 0) {
                this.emptyCartMessage.style.display = 'block';
                this.cartSummary.style.display = 'none';
                this.checkoutBtn.style.display = 'none';
            } else {
                this.emptyCartMessage.style.display = 'none';
                this.cartSummary.style.display = 'block';
                this.checkoutBtn.style.display = 'block';
            }
        }
    }
    
    /**
     * Artikelmenge verringern
     * @param {number} index - Artikelindex im Warenkorb
     */
    decreaseQuantity(index) {
        if (this.cart[index].quantity > 1) {
            this.cart[index].quantity--;
            this.updateCartDisplay();
            this.saveCart();
        }
    }
    
    /**
     * Artikelmenge erhöhen
     * @param {number} index - Artikelindex im Warenkorb
     */
    increaseQuantity(index) {
        this.cart[index].quantity++;
        this.updateCartDisplay();
        this.saveCart();
    }
    
    /**
     * Artikel aus dem Warenkorb entfernen
     * @param {number} index - Artikelindex im Warenkorb
     */
    removeItem(index) {
        this.cart.splice(index, 1);
        this.updateCartDisplay();
        this.saveCart();
    }
    
    /**
     * Warenkorbartikel rendern
     */
    renderCartItems() {
        // Prüfen, ob cartItems Element existiert (wir könnten auf einer Seite ohne Warenkorb sein)
        if (!this.cartItems) return;
        
        // Alle Kinder entfernen, einschließlich der Leerwarenkorb-Nachricht
        while (this.cartItems.firstChild) {
            this.cartItems.removeChild(this.cartItems.firstChild);
        }
        
        // Die Leerwarenkorb-Nachricht wieder hinzufügen
        if (this.emptyCartMessage) {
            this.cartItems.appendChild(this.emptyCartMessage);
        } else {
            // Leerwarenkorb-Nachricht erstellen, falls sie nicht existiert
            const emptyMessage = document.createElement('p');
            emptyMessage.id = 'empty-cart-message';
            emptyMessage.textContent = 'Ihr Warenkorb ist leer.';
            this.cartItems.appendChild(emptyMessage);
            this.emptyCartMessage = emptyMessage;
        }
        
        // Wenn Warenkorb leer ist, Nachricht anzeigen
        if (this.cart.length === 0) {
            if (this.emptyCartMessage) this.emptyCartMessage.style.display = 'block';
            if (this.cartSummary) this.cartSummary.style.display = 'none';
            if (this.checkoutBtn) this.checkoutBtn.style.display = 'none';
            return;
        }
        
        if (this.emptyCartMessage) this.emptyCartMessage.style.display = 'none';
        
        // Artikel zum Warenkorb hinzufügen
        this.cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.style.display = 'flex';
            cartItem.style.alignItems = 'center';
            cartItem.style.marginBottom = '20px';
            cartItem.style.paddingBottom = '20px';
            cartItem.style.borderBottom = '1px solid #eee';
            
            // Artikelbild
            const itemImage = document.createElement('div');
            itemImage.style.width = '80px';
            itemImage.style.height = '80px';
            itemImage.style.marginRight = '20px';
            itemImage.style.backgroundImage = item.image;
            itemImage.style.backgroundSize = 'cover';
            itemImage.style.backgroundPosition = 'center';
            
            // Artikeldetails
            const itemDetails = document.createElement('div');
            itemDetails.style.flex = '1';
            
            const itemTitle = document.createElement('div');
            itemTitle.textContent = item.title;
            itemTitle.style.fontWeight = 'bold';
            itemTitle.style.marginBottom = '5px';
            
            const itemSize = document.createElement('div');
            itemSize.textContent = item.size || ''; // Anzeige der Gemäldegröße
            itemSize.style.fontSize = '14px';
            itemSize.style.color = '#666';
            itemSize.style.marginBottom = '5px';
            
            const itemPrice = document.createElement('div');
            itemPrice.textContent = `CHF ${item.price.toFixed(2)}`;
            
            itemDetails.appendChild(itemTitle);
            itemDetails.appendChild(itemSize);
            itemDetails.appendChild(itemPrice);
            
            // Mengensteuerung
            const quantityControls = document.createElement('div');
            quantityControls.style.display = 'flex';
            quantityControls.style.alignItems = 'center';
            quantityControls.style.marginRight = '20px';
            
            const decreaseBtn = document.createElement('button');
            decreaseBtn.textContent = '-';
            decreaseBtn.style.width = '30px';
            decreaseBtn.style.height = '30px';
            decreaseBtn.style.border = '1px solid #ddd';
            decreaseBtn.style.background = 'white';
            decreaseBtn.style.cursor = 'pointer';
            decreaseBtn.addEventListener('click', () => this.decreaseQuantity(index));
            
            const quantityDisplay = document.createElement('span');
            quantityDisplay.textContent = item.quantity;
            quantityDisplay.style.padding = '0 10px';
            
            const increaseBtn = document.createElement('button');
            increaseBtn.textContent = '+';
            increaseBtn.style.width = '30px';
            increaseBtn.style.height = '30px';
            increaseBtn.style.border = '1px solid #ddd';
            increaseBtn.style.background = 'white';
            increaseBtn.style.cursor = 'pointer';
            increaseBtn.addEventListener('click', () => this.increaseQuantity(index));
            
            // Artikelgesamtpreis
            const itemTotal = document.createElement('div');
            itemTotal.textContent = `CHF ${(item.price * item.quantity).toFixed(2)}`;
            itemTotal.style.width = '80px';
            itemTotal.style.textAlign = 'right';
            itemTotal.style.fontWeight = 'bold';
            
            // Entfernen-Button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.style.marginLeft = '20px';
            removeBtn.style.width = '30px';
            removeBtn.style.height = '30px';
            removeBtn.style.border = 'none';
            removeBtn.style.background = 'transparent';
            removeBtn.style.fontSize = '20px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.color = '#999';
            removeBtn.addEventListener('click', () => this.removeItem(index));
            
            // Mengensteuerung zusammenstellen
            quantityControls.appendChild(decreaseBtn);
            quantityControls.appendChild(quantityDisplay);
            quantityControls.appendChild(increaseBtn);
            
            // Warenkorbartikel zusammenstellen
            cartItem.appendChild(itemImage);
            cartItem.appendChild(itemDetails);
            cartItem.appendChild(quantityControls);
            cartItem.appendChild(itemTotal);
            cartItem.appendChild(removeBtn);
            
            this.cartItems.appendChild(cartItem);
        });
        
        // Prüfen, ob die Zusammenfassungselemente existieren
        if (!this.subtotalElement || !this.totalElement) return;
        
        // Gesamtbeträge aktualisieren - mit Versandkosten
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        const shipping = totalItems * this.shippingCostPerItem; // CHF 50 pro Artikel
        const total = subtotal + shipping;
        
        this.subtotalElement.textContent = `CHF ${subtotal.toFixed(2)}`;
        
        // Versandkosten hinzufügen oder aktualisieren
        if (this.shippingElement) {
            this.shippingElement.textContent = `CHF ${shipping.toFixed(2)}`;
        } else if (this.cartSummary) {
            // Wenn das Versandkosten-Element nicht existiert, den DOM aktualisieren
            const shippingDiv = document.createElement('div');
            shippingDiv.style.display = 'flex';
            shippingDiv.style.justifyContent = 'space-between';
            shippingDiv.style.marginBottom = '10px';
            
            const shippingLabel = document.createElement('span');
            shippingLabel.textContent = 'Versand (Post B):';
            
            const shippingCost = document.createElement('span');
            shippingCost.id = 'cart-shipping';
            shippingCost.textContent = `CHF ${shipping.toFixed(2)}`;
            
            shippingDiv.appendChild(shippingLabel);
            shippingDiv.appendChild(shippingCost);
            
            // Einfügen vor dem Gesamtbetrag
            const totalDiv = this.totalElement.parentNode;
            this.cartSummary.insertBefore(shippingDiv, totalDiv);
            
            // Referenz speichern
            this.shippingElement = shippingCost;
        }
        
        this.totalElement.textContent = `CHF ${total.toFixed(2)}`;
        
        // Warenkorbzusammenfassung und Checkout-Button anzeigen
        if (this.cartSummary) this.cartSummary.style.display = 'block';
        if (this.checkoutBtn) this.checkoutBtn.style.display = 'block';
    }
    
    /**
     * Warenkorbanzeige aktualisieren
     */
    updateCartDisplay() {
        this.updateCartCount();
        this.renderCartItems();
    }
    
    /**
     * Warenkorb anzeigen
     */
    showCart() {
        if (!this.cartSection) return; // Prüfen, ob wir auf einer Seite mit Warenkorb sind
        
        // Warenkorb-Ansicht aktualisieren
        this.renderCartItems();
        
        // Warenkorb-Abschnitt anzeigen
        this.cartSection.style.display = 'block';
        
        // Andere Abschnitte ausblenden
        if (this.checkoutForm) this.checkoutForm.style.display = 'none';
        if (this.orderConfirmation) this.orderConfirmation.style.display = 'none';
        
        // Warenkorb-Elemente anzeigen
        if (this.cartItems) this.cartItems.style.display = 'block';
        if (this.continueShoppingBtn) this.continueShoppingBtn.style.display = 'block';
        
        // Zur Warenkorb-Sektion scrollen
        window.location.href = '#cart';
    }
    
    /**
     * Warenkorb in localStorage speichern
     */
    saveCart() {
        // Persistenter localStorage-Schlüssel für die gesamte Galerie-Website
        localStorage.setItem('tatianasGalleriaCart', JSON.stringify(this.cart));
    }
    
    /**
     * Warenkorb aus localStorage laden
     */
    loadCart() {
        const savedCart = localStorage.getItem('tatianasGalleriaCart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
            } catch (e) {
                console.error('Fehler beim Laden des Warenkorbs aus localStorage:', e);
                this.cart = [];
            }
        }
    }
    
    /**
     * Warenkorb leeren
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
    }
    
    /**
     * Gesamtkosten berechnen
     * @returns {number} Gesamtbestellbetrag mit Versand
     */
    calculateTotal() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        const shipping = totalItems * this.shippingCostPerItem;
        return subtotal + shipping;
    }
}

// Warenkorb initialisieren, wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    window.brushstrokesCart = new ShoppingCart();
});

// Cart Icon Event Listener
document.addEventListener('DOMContentLoaded', function() {
    // Get the cart button
    const showCartBtn = document.getElementById('show-cart-btn');
    
    // Add click event listener
    if (showCartBtn) {
        showCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // If the cart object exists, show the cart
            if (window.brushstrokesCart) {
                window.brushstrokesCart.showCart();
            } else {
                // Fallback if cart object doesn't exist for some reason
                window.location.href = 'index.html#cart';
            }
        });
    }
});