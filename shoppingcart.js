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
        
        // Warenkorb aus localStorage laden, falls verfügbar
        this.loadCart();
        
        // Warenkorbanzeige aktualisieren
        this.updateCartDisplay();
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
        const priceValue = parseFloat(price.replace('CHF', ''));
        const imageSrc = card.querySelector('.product-image').style.backgroundImage;
        
        // Prüfen, ob Artikel bereits im Warenkorb ist
        const existingItemIndex = this.cart.findIndex(item => item.title === title);
        
        if (existingItemIndex > -1) {
            // Menge erhöhen
            this.cart[existingItemIndex].quantity += 1;
        } else {
            // Neuen Artikel hinzufügen
            this.cart.push({
                title: title,
                price: priceValue,
                quantity: 1,
                image: imageSrc
            });
        }
        
        // Warenkorbzähler aktualisieren
        this.updateCartCount();
        
        // Warenkorb in localStorage speichern
        this.saveCart();
        
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
        confirmMessage.style.background = '#4CAF50';
        confirmMessage.style.color = 'white';
        confirmMessage.style.padding = '10px 20px';
        confirmMessage.style.borderRadius = '4px';
        confirmMessage.style.zIndex = '1000';
        document.body.appendChild(confirmMessage);
        
        setTimeout(() => {
            confirmMessage.remove();
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
        this.checkoutForm.style.display = 'none';
        this.cartItems.style.display = 'block';
        this.cartSummary.style.display = 'flex';
        this.checkoutBtn.style.display = 'block';
        this.continueShoppingBtn.style.display = 'block';
    }
    
    /**
     * Bestellung aufgeben Button Klick handhaben
     * Hinweis: Dies wird jetzt von der PaymentProcessor-Klasse gehandhabt
     */
    handlePlaceOrder() {
        // Formular-Übermittlung wird jetzt von payment.js gehandhabt
        // Das native Formular-Submit-Event wird ausgelöst
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
        this.cartCount.textContent = totalItems;
        
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
        // Vorherige Artikel löschen (außer leere Warenkorbnachricht)
        while (this.cartItems.children.length > 1) {
            this.cartItems.removeChild(this.cartItems.lastChild);
        }
        
        // Wenn Warenkorb leer ist, Nachricht anzeigen
        if (this.cart.length === 0) {
            this.emptyCartMessage.style.display = 'block';
            this.cartSummary.style.display = 'none';
            this.checkoutBtn.style.display = 'none';
            return;
        }
        
        this.emptyCartMessage.style.display = 'none';
        
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
            
            const itemPrice = document.createElement('div');
            itemPrice.textContent = `CHF ${item.price.toFixed(2)}`;
            
            itemDetails.appendChild(itemTitle);
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
        
        // Gesamtbeträge aktualisieren - mit Versandkosten
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        const shipping = totalItems * this.shippingCostPerItem; // CHF 50 pro Artikel
        const total = subtotal + shipping;
        
        this.subtotalElement.textContent = `CHF ${subtotal.toFixed(2)}`;
        
        // Versandkosten hinzufügen oder aktualisieren
        if (this.shippingElement) {
            this.shippingElement.textContent = `CHF ${shipping.toFixed(2)}`;
        } else {
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
        this.cartSummary.style.display = 'block';
        this.checkoutBtn.style.display = 'block';
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
        this.renderCartItems();
        this.cartSection.style.display = 'block';
        this.checkoutForm.style.display = 'none';
        this.orderConfirmation.style.display = 'none';
        this.cartItems.style.display = 'block';
        this.continueShoppingBtn.style.display = 'block';
        window.location.href = '#cart';
    }
    
    /**
     * Warenkorb in localStorage speichern
     */
    saveCart() {
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