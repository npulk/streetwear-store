import { Events } from './Events.js';

export class HomeView {
  constructor() {}

  async render() {
    const itemListContainerElm = document.createElement('div');
    itemListContainerElm.id = 'item-list-container';

    const items = new ItemList();
    itemListContainerElm.appendChild(await items.render());

    return itemListContainerElm;
  }
}

export class ItemList {
  #events = null;
  #items = null;
  #list = null;

  constructor() {
    this.#events = Events.events();
  }

  async render() {
    this.#items = await this.#getItems();

    const parentContainer = document.createElement('div');
    parentContainer.id = 'parent-container';

    const searchInput = document.createElement('input');
    searchInput.id = 'search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search items...';

    const itemListElm = document.createElement('div');
    itemListElm.id = 'item-list';

    this.#list = document.createElement('ul');
    const listItems = this.#items.map(item => this.#makeItem(item));

    listItems.forEach(li => this.#list.appendChild(li));

    itemListElm.appendChild(this.#list);
    parentContainer.appendChild(searchInput);
    parentContainer.appendChild(itemListElm);

    return parentContainer;
  }

  #makeItem(item) {
    const li = document.createElement('li');
    li.classList.add('item');
    li.innerText = item.name;
    li.id = item.id;
  
    const button = document.createElement('button');
    button.innerText = 'Add to cart';
  
    button.addEventListener('click', async () => {
      console.log('Add to cart clicked for item:', item);
      await this.#addToCart(item.id);
      this.render();
    });
  
    li.appendChild(button);
    return li;
  }

  async #getItems() {
    try {
      const response = await fetch('http://localhost:3000/items');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Full fetched items data:', data);
      return data.map(item => new Item(item.name, item._id));
    } catch (e) {
      console.error('Fetch error:', e);
      return [];
    }
  }

  async #addToCart(id) {
    console.log('Attempting to add item with id:', id);
    console.log('Current items:', this.#items);
    const item = this.#items.find(item => item.id === id);
    if (!item) {
      console.error('Item not found. ID:', id);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'cart',
          itemId: item.id,
          quantity: 1,
          name: item.name
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Server response:', result);
      console.log('Item added to cart successfully');
    } catch (e) {
      console.error('Error adding item to cart:', e);
    }
  }
}

export class Item {
  constructor(name, id) {
    this.id = id;
    this.name = name;
  }
}