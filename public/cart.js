import { Events } from './Events.js';
import { Item } from './home.js';

export class CartView {
  #itemList;

  constructor() {
    this.#itemList = new ItemList(this);
  }

  async render() {
    const cartContainer = document.createElement('div');
    cartContainer.id = 'cart-container';

    const titleElm = document.createElement('h2');
    titleElm.innerText = 'Your Cart';
    cartContainer.appendChild(titleElm);

    const clearCartButton = document.createElement('button');
    clearCartButton.innerText = 'Clear Cart';
    clearCartButton.addEventListener('click', () => this.clearCart());
    cartContainer.appendChild(clearCartButton);

    this.itemListContainerElm = document.createElement('div');
    this.itemListContainerElm.id = 'item-list-container';

    await this.updateItemList();
    cartContainer.appendChild(this.itemListContainerElm);

    return cartContainer;
  }

  async updateView() {
    await this.updateItemList();
  }

  async updateItemList() {
    this.itemListContainerElm.innerHTML = '';
    this.itemListContainerElm.appendChild(await this.#itemList.render());
  }

  async clearCart() {
    try {
      const response = await fetch('http://localhost:3000/cart/cleanup', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.message);
      await this.updateItemList();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }
}

class ItemList {
  #events = null;
  #items = null;
  #list = null;
  #cartView = null;

  constructor(cartView) {
    this.#events = Events.events();
    this.#cartView = cartView;
  }

  async render() {
    this.#items = await this.#getItems();
    
    const itemListElm = document.createElement('div');
    itemListElm.id = 'item-list';

    if (this.#items.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.innerText = 'Your cart is empty.';
      itemListElm.appendChild(emptyMessage);
    } else {
      this.#list = document.createElement('ul');
      const listItems = this.#items.map(item => this.#makeItem(item));

      listItems.forEach(li => this.#list.appendChild(li));

      itemListElm.appendChild(this.#list);
    }

    return itemListElm;
  }

  #makeItem(item) {
    const li = document.createElement('li');
    li.classList.add('item');
    li.innerText = item.name;
    li.id = item.id;

    const button = document.createElement('button');
    button.innerText = 'Remove from cart';

    button.addEventListener('click', async () => {
      await this.#removeFromCart(item.id);
      this.#items = this.#items.filter(i => i.id !== item.id);
      if (this.#cartView) {
        await this.#cartView.updateItemList();
      }
    });

    li.appendChild(button);
    return li;
  }

  async #getItems() {
    try {
      const response = await fetch('http://localhost:3000/cart');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched cart data:', data);
      
      return data.filter(item => item.itemId && item.quantity).map(cartItem => new Item(cartItem.name || 'Unknown Item', cartItem._id));
    } catch (e) {
      console.error('Fetch error:', e);
      return [];
    }
  }
  
  async #removeFromCart(id) {
    await fetch('http://localhost:3000/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
  }
}